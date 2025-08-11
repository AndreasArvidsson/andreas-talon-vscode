import {
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Disposable,
    languages,
    Position,
    Range,
    TextDocument,
    workspace,
} from "vscode";
import {
    getPythonPrefixAtPosition,
    getTalonPrefixAtPosition,
    TalonMatchPrefix,
} from "./matchers";
import { searchInWorkspace } from "./searchInWorkspace";
import { searchInDefaultTalonActions } from "./talonDefaultActions";

interface LanguageCompletionProvider extends CompletionItemProvider {
    readonly languageId: string;
    readonly triggererCharacters: string[];
}

abstract class TalonBaseCompletionProvider
    implements LanguageCompletionProvider
{
    abstract languageId: string;
    readonly triggererCharacters = ["."];

    async provideCompletionItems(
        document: TextDocument,
        position: Position,
    ): Promise<CompletionItem[]> {
        const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
        if (!workspaceFolder) {
            return [];
        }

        const match = this.getPrefixAtPosition(document, position);
        if (!match) {
            return [];
        }

        const defaultValues = searchInDefaultTalonActions(match).map(
            (a) => a.name,
        );
        const workspaceResults = await searchInWorkspace(
            workspaceFolder,
            match,
        );
        const workspaceValues = workspaceResults.map((r) => r.name);
        const values = defaultValues.concat(workspaceValues);

        const range = new Range(
            position.translate(undefined, -match.prefix.length),
            position.translate(undefined, -match.prefix.length),
        );

        const kind =
            match.type === "action"
                ? CompletionItemKind.Function
                : CompletionItemKind.Value;

        return Array.from(new Set(values)).map((label) => ({
            kind,
            range,
            label,
        }));
    }

    protected abstract getPrefixAtPosition(
        document: TextDocument,
        position: Position,
    ): TalonMatchPrefix | undefined;
}

class TalonCompletionProvider extends TalonBaseCompletionProvider {
    readonly languageId = "talon";

    protected getPrefixAtPosition(
        document: TextDocument,
        position: Position,
    ): TalonMatchPrefix | undefined {
        return getTalonPrefixAtPosition(document, position);
    }
}

class PythonCompletionProvider extends TalonBaseCompletionProvider {
    readonly languageId = "python";

    protected getPrefixAtPosition(
        document: TextDocument,
        position: Position,
    ): TalonMatchPrefix | undefined {
        return getPythonPrefixAtPosition(document, position);
    }
}

class SnippetCompletionProvider implements LanguageCompletionProvider {
    readonly languageId = "snippet";
    readonly triggererCharacters = ["."];

    provideCompletionItems(
        document: TextDocument,
        position: Position,
    ): CompletionItem[] {
        const line = document.lineAt(position.line);

        if (line.firstNonWhitespaceCharacterIndex !== 0) {
            return [];
        }

        const precedingText = line.text.substring(0, position.character);
        const variableMatch = precedingText.match(/^(\$\d+\.)(.*)/);

        const { fields, prefix, range } = (() => {
            if (variableMatch != null) {
                const prefix = variableMatch[2];
                const fields = [
                    "insertionFormatter",
                    "wrapperPhrase",
                    "wrapperScope",
                ];
                const range = new Range(
                    position.translate(undefined, -prefix.length),
                    position.translate(undefined, -prefix.length),
                );
                return { fields, prefix, range };
            }

            const fields = ["name", "phrase", "insertionScope", "language"];
            const range = new Range(position.line, 0, position.line, 0);
            return { fields, range, prefix: precedingText };
        })();

        return fields
            .filter((f) => f.startsWith(prefix))
            .map((field) => ({
                kind: CompletionItemKind.Field,
                range,
                label: field,
                insertText: `${field}: `,
            }));
    }
}

function registerCompletionProvider(
    provider: LanguageCompletionProvider,
): Disposable {
    return languages.registerCompletionItemProvider(
        provider.languageId,
        provider,
        ...provider.triggererCharacters,
    );
}

export function registerLanguageCompletionProviders(): Disposable {
    return Disposable.from(
        registerCompletionProvider(new TalonCompletionProvider()),
        registerCompletionProvider(new PythonCompletionProvider()),
        registerCompletionProvider(new SnippetCompletionProvider()),
    );
}
