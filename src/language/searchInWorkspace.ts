import path from "node:path";
import { promises as fs } from "node:fs";
import { DefinitionLink, Range, Uri, WorkspaceFolder } from "vscode";
import { TalonMatch } from "./matchers";
import { WS, ANY, NS } from "./RegexUtils";
import { getGitIgnore } from "../util/gitIgnore";

interface SearchScope {
    regex: RegExp;
    gitIgnore: (path: string) => boolean;
}

export async function searchInWorkspace(
    workspace: WorkspaceFolder,
    talonMatch: TalonMatch
): Promise<DefinitionLink[]> {
    const workspacePath = workspace.uri.fsPath;
    const scope: SearchScope = {
        regex: getRegexForMatch(talonMatch),
        gitIgnore: getGitIgnore(workspacePath)
    };
    return searchInDirectory(scope, workspacePath, "");
}

function getRegexForMatch(talonMatch: TalonMatch) {
    const { text, type } = talonMatch;
    switch (type) {
        case "action":
        case "capture":
            return new RegExp(`(def${WS})(${text})${WS}\\(${ANY}\\)${ANY}:`, "g");
        case "list":
            return new RegExp(`(\\w+\\.lists\\["${NS})(${text})"\\]`, "g");
    }
}

async function searchInPath(
    searchScope: SearchScope,
    absolutePath: string,
    relativePath: string,
    filename: string
): Promise<DefinitionLink[]> {
    // Filenames starting with `.` are ignored by Talon.
    if (filename.startsWith(".") || searchScope.gitIgnore(relativePath)) {
        return [];
    }

    // Python file. Parse for content.
    if (relativePath.endsWith(".py")) {
        return parsePythonFile(searchScope.regex, absolutePath);
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
): Promise<DefinitionLink[]> {
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

async function parsePythonFile(regex: RegExp, absolutePath: string): Promise<DefinitionLink[]> {
    const fileContent = await fs.readFile(absolutePath, "utf-8");
    const matches = Array.from(fileContent.matchAll(regex));
    if (!matches.length) {
        return [];
    }
    const uri = Uri.file(absolutePath);
    return extractionCallback(uri, matches, fileContent);
}

function extractionCallback(
    uri: Uri,
    matches: RegExpMatchArray[],
    fileContent: string
): DefinitionLink[] {
    return matches.map((match) => {
        const leadingLines = fileContent.slice(0, match.index ?? 0).split("\n");
        const line = leadingLines.length - 1;
        const indentationLength = leadingLines[leadingLines.length - 1].length;
        const matchLines = match[0].split("\n");
        return {
            targetUri: uri,
            // This is just the function name
            targetSelectionRange: new Range(
                line,
                indentationLength + match[1].length,
                line,
                indentationLength + match[1].length + match[2].length
            ),
            // This is the entire function signature
            targetRange: new Range(
                line,
                indentationLength,
                line + matchLines.length - 1,
                (matchLines.length === 1 ? indentationLength : 0) +
                    matchLines[matchLines.length - 1].length
            )
        };
    });
}
