import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    DefinitionLink,
    DefinitionProvider,
    Disposable,
    Hover,
    HoverProvider,
    languages,
    MarkdownString,
    Position,
    Range,
    TextDocument,
    workspace
} from "vscode";
import { getFilename } from "../util/fileSystem";
import { searchInDefaultActions } from "./defaultActions";
import {
    getPythonMatchAtPosition,
    getPythonPrefixAtPosition,
    getTalonMatchAtPosition,
    getTalonPrefixAtPosition,
    TalonMatchName,
    TalonMatchPrefix
} from "./matchers";
import { searchInWorkspace } from "./searchInWorkspace";

abstract class ProviderDefinition implements DefinitionProvider {
    async provideDefinition(
        document: TextDocument,
        position: Position,
        _token: CancellationToken
    ): Promise<DefinitionLink[]> {
        const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            return [];
        }

        const match = this.getMatchAtPosition(document, position);
        if (!match) {
            return [];
        }

        return searchInWorkspace(workspaceFolder, match);
    }

    protected abstract getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined;
}

class ProviderDefinitionTalon extends ProviderDefinition {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getTalonMatchAtPosition(document, position);
    }
}

class ProviderDefinitionPython extends ProviderDefinition {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getPythonMatchAtPosition(document, position);
    }
}

abstract class ProviderHover implements HoverProvider {
    async provideHover(
        document: TextDocument,
        position: Position,
        _token: CancellationToken
    ): Promise<Hover | undefined> {
        const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            return undefined;
        }

        const match = this.getMatchAtPosition(document, position);
        if (!match) {
            return undefined;
        }

        const workspaceResults = await searchInWorkspace(workspaceFolder, match);

        const defaultStrings = searchInDefaultActions(match).map((a) => {
            return new MarkdownString()
                .appendMarkdown(a.path)
                .appendCodeblock(a.targetText, a.language);
        });

        const userStrings = workspaceResults.map((r) => {
            const name = getFilename(r.targetUri);
            const line = r.targetRange.start.line + 1;

            const link =
                line > 1
                    ? `[${name} #${line}](${r.targetUri.path}#${line})`
                    : `[${name}](${r.targetUri.path})`;
            return new MarkdownString()
                .appendMarkdown(link)
                .appendCodeblock(r.targetText, r.language);
        });

        return new Hover([...defaultStrings, ...userStrings]);
    }

    protected abstract getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined;
}

class ProviderHoverTalon extends ProviderHover {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getTalonMatchAtPosition(document, position);
    }
}

class ProviderHoverPython extends ProviderHover {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getPythonMatchAtPosition(document, position);
    }
}

abstract class ProviderCompletionItem implements CompletionItemProvider {
    static readonly triggererCharacters = ["."];

    async provideCompletionItems(
        document: TextDocument,
        position: Position
    ): Promise<CompletionItem[]> {
        const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            return [];
        }

        const match = this.getPrefixAtPosition(document, position);
        if (!match) {
            return [];
        }

        const defaultValues = searchInDefaultActions(match).map((a) => a.name);
        const workspaceResults = await searchInWorkspace(workspaceFolder, match);
        const workspaceValues = workspaceResults.map((r) => r.name);
        const values = defaultValues.concat(workspaceValues);

        const range = new Range(
            position.translate(undefined, -match.prefix.length),
            position.translate(undefined, -match.prefix.length)
        );

        const kind =
            match.type === "action" ? CompletionItemKind.Function : CompletionItemKind.Value;

        return Array.from(new Set(values)).map((label) => ({
            kind,
            range,
            label
        }));
    }

    protected abstract getPrefixAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchPrefix | undefined;
}

class ProviderCompletionItemTalon extends ProviderCompletionItem {
    protected getPrefixAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchPrefix | undefined {
        return getTalonPrefixAtPosition(document, position);
    }
}

class ProviderCompletionItemPython extends ProviderCompletionItem {
    protected getPrefixAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchPrefix | undefined {
        return getPythonPrefixAtPosition(document, position);
    }
}

export function registerLanguageDefinitions(): Disposable {
    return Disposable.from(
        languages.registerDefinitionProvider("talon", new ProviderDefinitionTalon()),
        languages.registerDefinitionProvider("python", new ProviderDefinitionPython()),
        languages.registerHoverProvider("talon", new ProviderHoverTalon()),
        languages.registerHoverProvider("python", new ProviderHoverPython()),
        languages.registerCompletionItemProvider(
            "talon",
            new ProviderCompletionItemTalon(),
            ...ProviderCompletionItem.triggererCharacters
        ),
        languages.registerCompletionItemProvider(
            "python",
            new ProviderCompletionItemPython(),
            ...ProviderCompletionItem.triggererCharacters
        )
    );
}
