import {
    CancellationToken,
    DefinitionLink,
    Disposable,
    Hover,
    languages,
    MarkdownString,
    Position,
    TextDocument,
    workspace
} from "vscode";
import { getPythonMatchAtPosition, getTalonMatchAtPosition } from "./language/matchers";
import { searchInWorkspace } from "./language/searchInWorkspace";
import { getFilename } from "./util/fileSystem";

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

export function registerLanguageDefinitions(): Disposable {
    return Disposable.from(
        languages.registerDefinitionProvider(
            { language: "talon" },
            { provideDefinition: provideDefinitionTalon }
        ),
        languages.registerDefinitionProvider(
            { language: "python" },
            { provideDefinition: provideDefinitionPython }
        ),
        languages.registerHoverProvider({ language: "talon" }, { provideHover: provideHoverTalon })
    );
}
