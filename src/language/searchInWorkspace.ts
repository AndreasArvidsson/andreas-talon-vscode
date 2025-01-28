import { promises as fs } from "node:fs";
import path from "node:path";
import { DefinitionLink, Range, Uri, WorkspaceFolder } from "vscode";
import { getGitIgnore } from "../util/gitIgnore";
import { TalonMatch, TalonMatchType } from "./matchers";

export interface SearchResult extends DefinitionLink {
    targetText: string;
    name: string;
    language: string;
    type: TalonMatchType;
}

interface Namespace {
    name: string;
    line: number;
}

type GitIgnore = (path: string) => boolean;

type GetNamespace = (line: number, name: string) => string | undefined;

// @ ID .action_class (" \w ")
const classRegex = /^@[\w\d]+\.action_class(?:\("(\w+)"\))?/gm;
// INDENT def WS NAME WS ( ANY ) -> TYPE :
const actionRegex = /^([ \t]+def\s+)([\w\d]+)\s*\([\s\S]*?\)[\s\S]*?:(\s+"{3}[\s\S]+?"{3})?/gm;
// @ ID .capture ( ANY ) WS def NAME ( ANY ) -> TYPE :
const captureRegex = /^(@\w+\.capture\([\s\S]*?\)\s+def\s+)([\w\d]+)\s*\([\s\S]*?\)[\s\S]*?:/gm;
// @ ID .dynamic_list ( NAME ) def NAME ( ANY ) -> TYPE :
const dynamicListRegex =
    /^(@\w+\.dynamic_list\(")([\w.]+)"\)\s+def\s+([\w\d]+)\s*\([\s\S]*?\)[\s\S]*?:/gm;
// ID .lists [ NAME ] WS = WS ([...]|{...}|[\w.()])
const listRegex =
    /(\w+\.lists\[")([\w.]+)"\]\s*=\s*(?:(?:\{[\s\S]*?\})|(?:\[[\s\S]*?\])|[\w.()]+)/gm;
// @ ANY (rule="NS.NAME"
const captureNameRegex = /^@[\s\S]*?\((?:path=)?"([\w.]+)"/;

export async function searchInWorkspace(
    workspace: WorkspaceFolder,
    match: TalonMatch
): Promise<SearchResult[]> {
    const results = await searchInWorkspaceInner(workspace);
    const resultsForType = (() => {
        switch (match.type) {
            case "action":
                return results.actions;
            case "capture":
                return results.captures;
            case "list":
                return results.lists;
            case "dynamic_list":
                throw Error(`Can't search specifically for dynamic lists`);
        }
    })();
    if ("name" in match) {
        const name = match.name.replace(/^self\./, "user.");
        return resultsForType.filter((r) => r.name === name);
    }
    const prefix = match.prefix.replace(/^self\./, "user.");
    return resultsForType.filter((r) => r.name.startsWith(prefix));
}

async function searchInWorkspaceInner(workspace: WorkspaceFolder) {
    const workspacePath = workspace.uri.fsPath;
    const actions: SearchResult[] = [];
    const captures: SearchResult[] = [];
    const lists: SearchResult[] = [];
    const results = await searchInDirectory(getGitIgnore(workspacePath), workspacePath, "");
    results.forEach((r) => {
        switch (r.type) {
            case "action":
                actions.push(r);
                break;
            case "capture":
                captures.push(r);
                break;
            case "list":
                lists.push(r);
                break;
            case "dynamic_list":
                lists.push(r);
                break;
        }
    });
    return { actions, captures, lists };
}

async function searchInDirectory(
    gitIgnore: GitIgnore,
    absolutePath: string,
    relativePath: string
): Promise<SearchResult[]> {
    const files = await fs.readdir(absolutePath);
    const definitions = await Promise.all(
        files.map((filename) =>
            searchInPath(
                gitIgnore,
                path.join(absolutePath, filename),
                path.join(relativePath, filename),
                filename
            )
        )
    );
    return definitions.flat();
}

async function searchInPath(
    gitIgnore: GitIgnore,
    absolutePath: string,
    relativePath: string,
    filename: string
): Promise<SearchResult[]> {
    // Filenames starting with `.` are ignored by Talon.
    if (filename.startsWith(".") || gitIgnore(relativePath)) {
        return [];
    }

    // Python file. Parse for content.
    if (relativePath.endsWith(".py")) {
        return parsePythonFile(absolutePath);
    }

    // Talon list file. Parse for content.
    if (relativePath.endsWith(".talon-list")) {
        return parseTalonListFile(absolutePath);
    }

    // Files with unrelated file endings. Just ignore.
    if (/\.\w+$/.test(relativePath)) {
        return [];
    }

    const fileStats = await fs.stat(absolutePath);
    return fileStats.isDirectory() ? searchInDirectory(gitIgnore, absolutePath, relativePath) : [];
}

async function parsePythonFile(absolutePath: string): Promise<SearchResult[]> {
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    const uri = Uri.file(absolutePath);

    return [
        ...parsePythonFileInner(uri, fileContent, "action", actionRegex),
        ...parsePythonFileInner(uri, fileContent, "capture", captureRegex),
        ...parsePythonFileInner(uri, fileContent, "list", listRegex),
        ...parsePythonFileInner(uri, fileContent, "dynamic_list", dynamicListRegex)
    ];
}

function getTalonNamespacesFromPython(regex: RegExp, fileContent: string): Namespace[] {
    const matches = Array.from(fileContent.matchAll(regex));
    return matches
        .map((m) => ({
            name: m[1] ?? "user",
            line: fileContent.slice(0, m.index ?? 0).split("\n").length - 1
        }))
        .sort((a, b) => a.line - b.line);
}

function parsePythonFileInner(
    uri: Uri,
    fileContent: string,
    type: TalonMatchType,
    regex: RegExp
): SearchResult[] {
    const matches = Array.from(fileContent.matchAll(regex));
    if (!matches.length) {
        return [];
    }

    let getNamespace: GetNamespace | undefined;

    if (type === "action") {
        const namespaces = getTalonNamespacesFromPython(classRegex, fileContent);

        if (!namespaces.length) {
            return [];
        }

        getNamespace = (line: number, _name: string): string | undefined => {
            let res = undefined;
            for (const ns of namespaces) {
                if (ns.line >= line) {
                    break;
                }
                // Actions in the main namespace is not prefixed
                res = ns.name === "main" ? "" : ns.name;
            }
            return res;
        };
    } else if (type === "capture") {
        getNamespace = (line: number, content: string): string | undefined => {
            const name = content.match(captureNameRegex)?.[1];
            if (!name) {
                return "user";
            }
            const index = name.indexOf(".");
            return index > -1 ? name.substring(0, index) : "";
        };
    }

    return parsePythonMatches(uri, fileContent, matches, type, getNamespace);
}

async function parseTalonListFile(absolutePath: string): Promise<SearchResult[]> {
    // list: WS NAME
    const regex = /^(list:\s*)([\w.]+)/g;
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    const matches = Array.from(fileContent.matchAll(regex));
    if (matches.length !== 1) {
        return [];
    }
    const uri = Uri.file(absolutePath);
    return parseTalonListMatch(uri, fileContent, matches[0]);
}

function parsePythonMatches(
    uri: Uri,
    fileContent: string,
    matches: RegExpMatchArray[],
    type: TalonMatchType,
    getNamespace?: GetNamespace
): SearchResult[] {
    const results: SearchResult[] = [];

    matches.forEach((match) => {
        const leadingLines = fileContent.slice(0, match.index ?? 0).split("\n");
        const line = leadingLines.length - 1;
        const indentationLength = leadingLines[leadingLines.length - 1].length;
        const matchLines = match[0].split("\n");
        const ns = getNamespace ? getNamespace(line, match[0]) : "";

        // This function does not belong to a Talon actions class
        if (ns == null || match[2].startsWith("_")) {
            return;
        }

        // This is the entire function signature
        const targetRange = new Range(
            line,
            indentationLength,
            line + matchLines.length - 1,
            (matchLines.length === 1 ? indentationLength : 0) +
                matchLines[matchLines.length - 1].length
        );

        // This is just the function name
        const nameOffsetLines = match[1].split("\n");
        const nameOffsetRow = nameOffsetLines.length - 1;
        const nameOffsetCol = nameOffsetLines[nameOffsetLines.length - 1].length;
        const targetSelectionRange = new Range(
            line + nameOffsetRow,
            indentationLength + nameOffsetCol,
            line + nameOffsetRow,
            indentationLength + nameOffsetCol + match[2].length
        );

        // Format name and target text for display
        const name = match[2].replace(/^self\./, "user.");
        const fullName = ns ? `${ns === "self" ? "user" : ns}.${name}` : name;
        const indentation = match[0].match(/^\s+/)?.[0] ?? "";
        const targetText = indentation
            ? match[0].replace(new RegExp(`^${indentation}`, "gm"), "")
            : match[0];

        results.push({
            type,
            language: "python",
            targetUri: uri,
            targetRange,
            targetSelectionRange,
            targetText,
            name: fullName
        });
    });

    return results;
}

function parseTalonListMatch(
    uri: Uri,
    fileContent: string,
    match: RegExpMatchArray
): SearchResult[] {
    const lines = fileContent.split("\n");
    const lastLineIndex = lines.length - 1;
    const targetRange = new Range(0, 0, lastLineIndex, lines[lastLineIndex].length);
    const targetSelectionRange = new Range(
        0,
        match[1].length,
        0,
        match[1].length + match[2].length
    );
    return [
        {
            type: "list",
            language: "talon",
            targetUri: uri,
            targetRange,
            targetSelectionRange,
            targetText: fileContent,
            name: match[2].replace(/^self\./, "user.")
        }
    ];
}
