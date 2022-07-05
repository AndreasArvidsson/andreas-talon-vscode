import {
    CancellationToken,
    Definition,
    DefinitionLink,
    Disposable,
    languages,
    Location,
    Position,
    Range,
    TextDocument,
    Uri,
    workspace,
} from "vscode";
import { promises as fs } from "fs";
import * as path from "path";

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
    token: CancellationToken
): Promise<Definition | DefinitionLink[]> {
    const positionAndFolder = getPositionAndFolder(document, position);
    if (!positionAndFolder) {
        return [];
    }
    const { wordText, lineText, folderPath } = positionAndFolder;
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
        };
    }

    // Test for Talon list
    else if (testWordAtPosition(position, lineText, listRegex)) {
        scope = {
            regex: new RegExp(`(\\w+\\.lists\\["${NS})(${wordText})"\\]`, "g"),
            callback: extractionCallback,
        };
    }

    return scope != null ? searchInDirectory(folderPath, scope) : [];
}

async function provideDefinitionPython(
    document: TextDocument,
    position: Position,
    token: CancellationToken
): Promise<Definition | DefinitionLink[]> {
    const positionAndFolder = getPositionAndFolder(document, position);
    if (!positionAndFolder) {
        return [];
    }
    const { wordText, lineText, folderPath } = positionAndFolder;
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
        };
    }

    return scope != null ? searchInDirectory(folderPath, scope) : [];
}

function extractionCallback(
    uri: Uri,
    matches: RegExpMatchArray[],
    fileContent: string
): DefinitionLink[] {
    return matches.map((match) => {
        const leadingLines = fileContent.slice(0, match.index!).split("\n");
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

function getPositionAndFolder(document: TextDocument, position: Position) {
    const folder = workspace.getWorkspaceFolder(document.uri);
    if (!folder) {
        return null;
    }
    const wordAtPosition = getWordAtPosition(document, position);
    if (!wordAtPosition) {
        return null;
    }
    return { ...wordAtPosition, folderPath: folder.uri.fsPath };
}

function testWordAtPosition(
    position: Position,
    lineText: string,
    regex: RegExp
) {
    return !!Array.from(lineText.matchAll(regex)).find(
        (match) =>
            position.character >= match.index! &&
            position.character <= match.index! + match[0].length
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
    callback: (
        uri: Uri,
        matches: RegExpMatchArray[],
        fileContent: string
    ) => DefinitionLink[];
}

async function searchInPath(
    fsPath: string,
    searchScope: SearchScope
): Promise<DefinitionLink[]> {
    if (fsPath.endsWith(".py")) {
        return searchInPythonFile(fsPath, searchScope);
    }
    const fileStats = await fs.stat(fsPath);
    return fileStats.isDirectory()
        ? searchInDirectory(fsPath, searchScope)
        : [];
}

async function searchInDirectory(
    fsPath: string,
    searchScope: SearchScope
): Promise<DefinitionLink[]> {
    const files = await fs.readdir(fsPath);
    const definitions = await Promise.all(
        files.map((file) => searchInPath(path.join(fsPath, file), searchScope))
    );
    return definitions.flat();
}

async function searchInPythonFile(
    fsPath: string,
    searchScope: SearchScope
): Promise<DefinitionLink[]> {
    const { regex, callback } = searchScope;
    const fileContent = await fs.readFile(fsPath, { encoding: "utf-8" });
    const uri = Uri.file(fsPath);
    const matches = Array.from(fileContent.matchAll(regex));
    return matches.length ? callback(uri, matches, fileContent) : [];
}

export function registerLanguageDefinitions() {
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
