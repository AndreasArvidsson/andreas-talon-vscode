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

export async function provideDefinitionTalon(
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

export async function provideDefinitionPython(
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

function provideHoverTalon(
    document: TextDocument,
    position: Position,
    _token: CancellationToken
): Hover {
    const ms = new MarkdownString("value2");
    return new Hover("stuff");
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
