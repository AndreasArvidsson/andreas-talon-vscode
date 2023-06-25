import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    DefinitionLink,
    Disposable,
    Hover,
    languages,
    MarkdownString,
    Position,
    Range,
    TextDocument,
    workspace
} from "vscode";
import { getFilename } from "../util/fileSystem";
import { getPythonMatchAtPosition, getTalonMatchAtPosition, TalonMatch } from "./matchers";
import { searchInWorkspace } from "./searchInWorkspace";

async function provideDefinitionTalon(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Promise<DefinitionLink[]> {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return [];
    }

    const match = getTalonMatchAtPosition(document, position);
    if (!match) {
        return [];
    }

    return searchInWorkspace(workspaceFolder, match);
}

async function provideDefinitionPython(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Promise<DefinitionLink[]> {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return [];
    }

    const match = getPythonMatchAtPosition(document, position);
    if (!match) {
        return [];
    }

    return searchInWorkspace(workspaceFolder, match);
}

async function provideHoverTalon(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Promise<Hover | undefined> {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return undefined;
    }

    const match = getTalonMatchAtPosition(document, position);
    if (!match) {
        return undefined;
    }

    const result = await searchInWorkspace(workspaceFolder, match);
    if (!result.length) {
        return undefined;
    }

    const value = result.map((r) => {
        const name = getFilename(r.targetUri);
        const link = `[${name}](${r.targetUri.path}#${r.targetRange.start.line + 1})`;
        return new MarkdownString().appendMarkdown(link).appendCodeblock(r.targetText, r.language);
    });

    return new Hover(value);
}

async function provideCompletionItemsTalon(
    document: TextDocument,
    position: Position
): Promise<CompletionItem[]> {
    const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) {
        return [];
    }

    const line = document.lineAt(position.line);
    const text = line.text.substring(0, position.character);
    const prefix = text.match(/[\w\d.]+$/)?.[0] ?? "";

    const match = ((): TalonMatch | undefined => {
        const isInScript = line.firstNonWhitespaceCharacterIndex !== 0 || text.includes(":");
        // When in the script side of the command available values are the action names
        if (isInScript) {
            return { type: "action", prefix };
        }
        const prevChar = text.substring(0, text.length - prefix.length).trim();
        // When in the rule side of the command available values are list and capture names
        if (prevChar.endsWith("{")) {
            return { type: "list", prefix };
        }
        if (prevChar.endsWith("<")) {
            return { type: "capture", prefix };
        }
        return undefined;
    })();

    if (!match) {
        return [];
    }

    const searchResults = await searchInWorkspace(workspaceFolder, match);
    const values = searchResults.map((r) => r.name);

    const range = new Range(
        position.translate(undefined, -prefix.length),
        position.translate(undefined, -prefix.length)
    );

    return Array.from(new Set(values)).map((v) => ({
        kind: CompletionItemKind.Value,
        label: v,
        range
    }));
}

export function registerLanguageDefinitions(): Disposable {
    return Disposable.from(
        languages.registerDefinitionProvider("talon", {
            provideDefinition: provideDefinitionTalon
        }),
        languages.registerDefinitionProvider("python", {
            provideDefinition: provideDefinitionPython
        }),
        languages.registerHoverProvider("talon", { provideHover: provideHoverTalon }),
        languages.registerCompletionItemProvider(
            "talon",
            { provideCompletionItems: provideCompletionItemsTalon },
            "."
        )
    );
}
