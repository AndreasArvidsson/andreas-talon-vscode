import * as fs from "node:fs/promises";
import * as path from "node:path";
import fastGlob from "fast-glob";
import type { DefinitionLink, WorkspaceFolder } from "vscode";
import { Range, Uri, window } from "vscode";
import { getErrorMessage } from "../util/getErrorMessage";
import { getGlobIgnorePatterns } from "../util/getGlobIgnorePatterns";
import { runPool } from "../util/runPool";
import type { TalonMatch, TalonMatchType } from "./matchers";

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

type GetNamespace = (line: number, name: string) => string | undefined;

// @ ID .action_class (" \w ")
const classRegex = /^@[\w\d]+\.action_class(?:\("(\w+)"\))?/gm;
// INDENT def WS NAME WS ( ANY ) -> TYPE :
const actionRegex =
    /^([ \t]+def\s+)([\w\d]+)\s*\([\s\S]*?\)[\s\S]*?:(\s+"{3}[\s\S]+?"{3})?/gm;
// @ ID .capture ( ANY ) WS def NAME ( ANY ) -> TYPE :
const captureRegex =
    /^(@\w+\.capture\([\s\S]*?\)\s+def\s+)([\w\d]+)\s*\([\s\S]*?\)[\s\S]*?:/gm;
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
    match: TalonMatch,
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
                throw new Error(`Can't search specifically for dynamic lists`);
            default: {
                const exhaustiveCheck: never = match.type;
                // oxlint-disable-next-line typescript/restrict-template-expressions
                throw new Error(`Unknown match type: ${exhaustiveCheck}`);
            }
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
    const actions: SearchResult[] = [];
    const captures: SearchResult[] = [];
    const lists: SearchResult[] = [];
    const results = await searchInDirectory(workspace);
    for (const r of results) {
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
            // no default
        }
    }
    return { actions, captures, lists };
}

async function searchInDirectory(
    workspace: WorkspaceFolder,
): Promise<SearchResult[]> {
    const workspacePath = workspace.uri.fsPath;
    const files = await fastGlob("**/*.{py,talon-list}", {
        cwd: workspacePath,
        ignore: getGlobIgnorePatterns(workspace),
        dot: false,
    });

    const result = await runPool(files, 8, async (file) => {
        try {
            const fileAbsolutePath = path.join(workspacePath, file);

            // Python file. Parse for content.
            if (file.endsWith(".py")) {
                return await parsePythonFile(fileAbsolutePath);
            }

            // Talon list file. Parse for content.
            if (file.endsWith(".talon-list")) {
                return await parseTalonListFile(fileAbsolutePath);
            }

            // Unknown file type.
            console.error(`Unknown file type: ${file}`);
            return [];
        } catch (error) {
            void window.showErrorMessage(getErrorMessage(error));
            return [];
        }
    });

    return result.flat();
}

async function parsePythonFile(absolutePath: string): Promise<SearchResult[]> {
    const fileContent = await fs.readFile(absolutePath, "utf8");
    const uri = Uri.file(absolutePath);

    return [
        ...parsePythonFileInner(uri, fileContent, "action", actionRegex),
        ...parsePythonFileInner(uri, fileContent, "capture", captureRegex),
        ...parsePythonFileInner(uri, fileContent, "list", listRegex),
        ...parsePythonFileInner(
            uri,
            fileContent,
            "dynamic_list",
            dynamicListRegex,
        ),
    ];
}

function getTalonNamespacesFromPython(
    regex: RegExp,
    fileContent: string,
): Namespace[] {
    const matches = Array.from(fileContent.matchAll(regex));
    return matches
        .map((m) => ({
            name: m.at(1) ?? "user",
            line: fileContent.slice(0, m.index).split("\n").length - 1,
        }))
        .toSorted((a, b) => a.line - b.line);
}

function parsePythonFileInner(
    uri: Uri,
    fileContent: string,
    type: TalonMatchType,
    regex: RegExp,
): SearchResult[] {
    const matches = Array.from(fileContent.matchAll(regex));
    if (matches.length === 0) {
        return [];
    }

    let getNamespace: GetNamespace | undefined;

    if (type === "action") {
        const namespaces = getTalonNamespacesFromPython(
            classRegex,
            fileContent,
        );

        if (namespaces.length === 0) {
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
            const name = captureNameRegex.exec(content)?.[1];
            if (name == null) {
                return "user";
            }
            const index = name.indexOf(".");
            return index !== -1 ? name.slice(0, index) : "";
        };
    }

    return parsePythonMatches(uri, fileContent, matches, type, getNamespace);
}

async function parseTalonListFile(
    absolutePath: string,
): Promise<SearchResult[]> {
    // list: WS NAME
    const regex = /^(list:\s*)([\w.]+)/g;
    const fileContent = await fs.readFile(absolutePath, "utf8");
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
    getNamespace?: GetNamespace,
): SearchResult[] {
    const results: SearchResult[] = [];

    for (const match of matches) {
        const leadingLines = fileContent.slice(0, match.index ?? 0).split("\n");
        const line = leadingLines.length - 1;
        const indentationLength = leadingLines[leadingLines.length - 1].length;
        const matchLines = match[0].split("\n");
        const ns = getNamespace ? getNamespace(line, match[0]) : "";

        // This function does not belong to a Talon actions class
        if (ns == null || match[2].startsWith("_")) {
            continue;
        }

        // This is the entire function signature
        const targetRange = new Range(
            line,
            indentationLength,
            line + matchLines.length - 1,
            (matchLines.length === 1 ? indentationLength : 0) +
                matchLines[matchLines.length - 1].length,
        );

        // This is just the function name
        const nameOffsetLines = match[1].split("\n");
        const nameOffsetRow = nameOffsetLines.length - 1;
        const nameOffsetCol =
            nameOffsetLines[nameOffsetLines.length - 1].length;
        const targetSelectionRange = new Range(
            line + nameOffsetRow,
            indentationLength + nameOffsetCol,
            line + nameOffsetRow,
            indentationLength + nameOffsetCol + match[2].length,
        );

        // Format name and target text for display
        const name = match[2].replace(/^self\./, "user.");
        const fullName = ns ? `${ns === "self" ? "user" : ns}.${name}` : name;
        const indentation = /^\s+/.exec(match[0])?.[0] ?? "";
        const targetText = indentation
            ? match[0].replaceAll(new RegExp(`^${indentation}`, "gm"), "")
            : match[0];

        results.push({
            type,
            language: "python",
            targetUri: uri,
            targetRange,
            targetSelectionRange,
            targetText,
            name: fullName,
        });
    }

    return results;
}

function parseTalonListMatch(
    uri: Uri,
    fileContent: string,
    match: RegExpMatchArray,
): SearchResult[] {
    const lines = fileContent.split("\n");
    const lastLineIndex = lines.length - 1;
    const targetRange = new Range(
        0,
        0,
        lastLineIndex,
        lines[lastLineIndex].length,
    );
    const targetSelectionRange = new Range(
        0,
        match[1].length,
        0,
        match[1].length + match[2].length,
    );
    return [
        {
            type: "list",
            language: "talon",
            targetUri: uri,
            targetRange,
            targetSelectionRange,
            targetText: fileContent,
            name: match[2].replace(/^self\./, "user."),
        },
    ];
}
