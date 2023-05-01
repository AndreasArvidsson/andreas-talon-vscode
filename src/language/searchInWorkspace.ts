import { promises as fs } from "node:fs";
import path from "node:path";
import { DefinitionLink, Range, Uri, WorkspaceFolder } from "vscode";
import { getGitIgnore } from "../util/gitIgnore";
import { ANY, NS, WS } from "./RegexUtils";
import { TalonMatch, TalonMatchType } from "./matchers";

interface SearchScope {
    pythonRegex: RegExp;
    listRegex?: RegExp;
    gitIgnore: (path: string) => boolean;
}

export interface SearchResult extends DefinitionLink {
    targetText: string;
    language: string;
}

export async function searchInWorkspace(
    workspace: WorkspaceFolder,
    talonMatch: TalonMatch
): Promise<SearchResult[]> {
    const workspacePath = workspace.uri.fsPath;
    const { text, type } = talonMatch;
    const scope: SearchScope = {
        ...getRegexForMatch(type, text),
        gitIgnore: getGitIgnore(workspacePath)
    };
    return searchInDirectory(scope, workspacePath, "");
}

function getRegexForMatch(type: TalonMatchType, text: string) {
    switch (type) {
        case "action":
        case "capture":
            return {
                pythonRegex: new RegExp(`(def${WS})(${text})${WS}\\(${ANY}\\)${ANY}:`, "g")
            };
        case "list": {
            const assign = `(${WS}=${WS}({${ANY}}|[${ANY}]|\\w+))`;
            return {
                pythonRegex: new RegExp(`(\\w+\\.lists\\["${NS})(${text})"\\]${assign}`, "g"),
                listRegex: new RegExp(`^(list:${WS}${NS})(${text})`, "g")
            };
        }
    }
}

async function searchInPath(
    searchScope: SearchScope,
    absolutePath: string,
    relativePath: string,
    filename: string
): Promise<SearchResult[]> {
    // Filenames starting with `.` are ignored by Talon.
    if (filename.startsWith(".") || searchScope.gitIgnore(relativePath)) {
        return [];
    }

    // Python file. Parse for content.
    if (relativePath.endsWith(".py")) {
        return parsePythonFile(searchScope.pythonRegex, absolutePath);
    }

    // Talon list file. Parse for content.
    if (relativePath.endsWith(".talon-list")) {
        return parseTalonListFile(searchScope.listRegex, absolutePath);
    }

    // Files with unrelated file endings. Just ignore.
    if (/\.\w+$/.test(relativePath)) {
        return [];
    }

    const fileStats = await fs.stat(absolutePath);
    return fileStats.isDirectory()
        ? searchInDirectory(searchScope, absolutePath, relativePath)
        : [];
}

async function searchInDirectory(
    searchScope: SearchScope,
    absolutePath: string,
    relativePath: string
): Promise<SearchResult[]> {
    const files = await fs.readdir(absolutePath);
    const definitions = await Promise.all(
        files.map((filename) =>
            searchInPath(
                searchScope,
                path.join(absolutePath, filename),
                path.join(relativePath, filename),
                filename
            )
        )
    );
    return definitions.flat();
}

async function parsePythonFile(regex: RegExp, absolutePath: string): Promise<SearchResult[]> {
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    const matches = Array.from(fileContent.matchAll(regex));
    if (!matches.length) {
        return [];
    }
    const uri = Uri.file(absolutePath);
    return parsePythonMatches(uri, matches, fileContent);
}

async function parseTalonListFile(
    regex: RegExp | undefined,
    absolutePath: string
): Promise<SearchResult[]> {
    if (regex == null) {
        return [];
    }
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    const matches = Array.from(fileContent.matchAll(regex));
    if (matches.length !== 1) {
        return [];
    }
    const uri = Uri.file(absolutePath);
    return parseTalonListMatches(uri, matches[0], fileContent);
}

function parsePythonMatches(
    uri: Uri,
    matches: RegExpMatchArray[],
    fileContent: string
): SearchResult[] {
    return matches.map((match) => {
        const leadingLines = fileContent.slice(0, match.index ?? 0).split("\n");
        const line = leadingLines.length - 1;
        const indentationLength = leadingLines[leadingLines.length - 1].length;
        const matchLines = match[0].split("\n");
        // This is the entire function signature
        const targetRange = new Range(
            line,
            indentationLength,
            line + matchLines.length - 1,
            (matchLines.length === 1 ? indentationLength : 0) +
                matchLines[matchLines.length - 1].length
        );
        // This is just the function name
        const targetSelectionRange = new Range(
            line,
            indentationLength + match[1].length,
            line,
            indentationLength + match[1].length + match[2].length
        );
        return {
            language: "python",
            targetUri: uri,
            targetRange,
            targetSelectionRange,
            targetText: match[0]
        };
    });
}

function parseTalonListMatches(
    uri: Uri,
    match: RegExpMatchArray,
    fileContent: string
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
            language: "talon",
            targetUri: uri,
            targetRange,
            targetSelectionRange,
            targetText: fileContent
        }
    ];
}
