import { promises as fs } from "fs";
import { compile as gitignoreCompiler } from "gitignore-parser";
import * as path from "path";
import {
    CancellationToken,
    Definition,
    DefinitionLink,
    Disposable,
    languages,
    Position,
    Range,
    TextDocument,
    Uri,
    workspace,
} from "vscode";

// Match namespace
const NS = "\\w*\\.?";
// Match any, non-greedy
const ANY = "[\\s\\S]*?";
// Match whitespace
const WS = "\\s*";

function createPythonFunctionRegex(name: string) {
    return new RegExp(`(def${WS})(${name})${WS}\\(${ANY}\\)${ANY}:`, "g");
}

async function provideDefinitionTalon(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Promise<Definition | DefinitionLink[]> {
    const positionAndWorkspace = getPositionAndWorkspace(document, position);
    if (!positionAndWorkspace) {
        return [];
    }

    const { wordText, lineText, workspacePath } = positionAndWorkspace;
    let scope: SearchScope | null = null;

    const actionRegex = new RegExp(`${NS}${wordText}\\(${ANY}\\)`, "g");
    const captureRegex = new RegExp(`<${NS}${wordText}>`, "g");
    const listRegex = new RegExp(`{${NS}${wordText}}`, "g");

    // Test for Talon action or capture
    if (
        testWordAtPosition(position, lineText, actionRegex) ||
        testWordAtPosition(position, lineText, captureRegex)
    ) {
        scope = {
            regex: createPythonFunctionRegex(wordText),
            callback: extractionCallback,
            gitIgnore: await getGitIgnore(workspacePath),
        };
    }

    // Test for Talon list
    else if (testWordAtPosition(position, lineText, listRegex)) {
        scope = {
            regex: new RegExp(`(\\w+\\.lists\\["${NS})(${wordText})"\\]`, "g"),
            callback: extractionCallback,
            gitIgnore: await getGitIgnore(workspacePath),
        };
    }

    return scope != null ? searchInDirectory(scope, workspacePath, "") : [];
}

async function provideDefinitionPython(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Promise<Definition | DefinitionLink[]> {
    const positionAndFolder = getPositionAndWorkspace(document, position);
    if (!positionAndFolder) {
        return [];
    }
    const { wordText, lineText, workspacePath } = positionAndFolder;
    let scope: SearchScope | null = null;

    const actionRegex = new RegExp(
        `actions\\.${NS}${wordText}\\(${ANY}\\)`,
        "g"
    );

    // Test for Talon action
    if (testWordAtPosition(position, lineText, actionRegex)) {
        scope = {
            regex: createPythonFunctionRegex(wordText),
            callback: extractionCallback,
            gitIgnore: await getGitIgnore(workspacePath),
        };
    }

    return scope != null ? searchInDirectory(scope, workspacePath, "") : [];
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
            ),
        };
    });
}

async function getGitIgnore(folderPath: string) {
    try {
        const gitignorePath = path.join(folderPath, ".gitignore");
        const gitignoreContent = await fs.readFile(gitignorePath, "utf8");
        const gitignore = gitignoreCompiler(gitignoreContent);
        return gitignore.denies;
    } catch (error) {
        return (_input: string) => false;
    }
}

function getPositionAndWorkspace(document: TextDocument, position: Position) {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return null;
    }
    const wordAtPosition = getWordAtPosition(document, position);
    if (!wordAtPosition) {
        return null;
    }
    return { ...wordAtPosition, workspacePath: workspaceFolder.uri.fsPath };
}

function testWordAtPosition(
    position: Position,
    lineText: string,
    regex: RegExp
): boolean {
    return Array.from(lineText.matchAll(regex)).some(
        (match) =>
            match.index != null &&
            position.character >= match.index &&
            position.character <= match.index + match[0].length
    );
}

function getWordAtPosition(document: TextDocument, position: Position) {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange || wordRange.isEmpty || !wordRange.isSingleLine) {
        return null;
    }
    const wordText = document.getText(wordRange);
    const lineText = document.lineAt(position).text;
    return { wordText, lineText };
}

interface SearchScope {
    regex: RegExp;
    gitIgnore: (path: string) => boolean;
    callback: (
        uri: Uri,
        matches: RegExpMatchArray[],
        fileContent: string
    ) => DefinitionLink[];
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
        return parsePythonFile(searchScope, absolutePath);
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

async function parsePythonFile(
    searchScope: SearchScope,
    absolutePath: string
): Promise<DefinitionLink[]> {
    const { regex, callback } = searchScope;
    const fileContent = await fs.readFile(absolutePath, { encoding: "utf-8" });
    const matches = Array.from(fileContent.matchAll(regex));
    if (!matches.length) {
        return [];
    }
    const uri = Uri.file(absolutePath);
    return callback(uri, matches, fileContent);
}

export function registerLanguageDefinitions(): Disposable {
    return Disposable.from(
        languages.registerDefinitionProvider(
            { language: "talon" },
            { provideDefinition: provideDefinitionTalon }
        ),
        languages.registerDefinitionProvider(
            { language: "python" },
            { provideDefinition: provideDefinitionPython }
        )
    );
}
