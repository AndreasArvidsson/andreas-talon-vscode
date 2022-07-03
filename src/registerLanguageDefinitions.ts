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

async function searchInPythonFile(
    fsPath: string,
    regex: RegExp
): Promise<DefinitionLink[]> {
    const content = await fs.readFile(fsPath, { encoding: "utf-8" });
    const matches = [...content.matchAll(regex)];
    return matches.map((match) => {
        const leadingLines = content.slice(0, match.index!).split("\n");
        const line = leadingLines.length - 1;
        const indentationLength = leadingLines[leadingLines.length - 1].length;
        const matchLines = match[0].split("\n");
        return {
            targetUri: Uri.file(fsPath),
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

async function searchInDirectory(
    fsPath: string,
    regex: RegExp
): Promise<DefinitionLink[]> {
    const files = await fs.readdir(fsPath);
    const definitions = await Promise.all(
        files.map((file) => searchInPath(path.join(fsPath, file), regex))
    );
    return definitions.flat();
}

async function searchInPath(
    fsPath: string,
    regex: RegExp
): Promise<DefinitionLink[]> {
    if (fsPath.endsWith(".py")) {
        return searchInPythonFile(fsPath, regex);
    }

    const fileStats = await fs.stat(fsPath);

    if (fileStats.isDirectory()) {
        return searchInDirectory(fsPath, regex);
    }

    return [];
}

const talonDefinitionProvider = {
    provideDefinition: async function (
        document: TextDocument,
        position: Position,
        token: CancellationToken
    ): Promise<Definition | DefinitionLink[]> {
        const wordAtPosition = getWordAtPosition(document, position);
        if (!wordAtPosition) {
            return [];
        }
        const folder = workspace.getWorkspaceFolder(document.uri);
        if (!folder) {
            return [];
        }

        const { range, text } = wordAtPosition;

        const regex = new RegExp(
            `(def\\s*)(${text})\\s*\\([\\s\\S]*?\\)\\s*:`,
            "g"
        );

        return searchInPath(folder.uri.fsPath, regex);
    },
};

function getWordAtPosition(document: TextDocument, position: Position) {
    const range = document.getWordRangeAtPosition(position);
    if (!range || range.isEmpty || !range.isSingleLine) {
        return;
    }
    const text = document.getText(range);
    const lineText = document.lineAt(position).text;
    const regex = new RegExp(`\\w+\\.${text}\\(.*\\)`, "g");
    const matches = [...lineText.matchAll(regex)];
    const match = matches[0];

    if (
        !match ||
        position.character < match.index! ||
        position.character > match.index! + match[0].length
    ) {
        return;
    }

    return { text, range };
}

export function registerLanguageDefinitions() {
    return Disposable.from(
        languages.registerDefinitionProvider(
            { language: "talon" },
            talonDefinitionProvider
        )
    );
}
