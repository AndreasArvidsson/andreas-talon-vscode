import {
    CancellationToken,
    DefinitionLink,
    DefinitionProvider,
    Disposable,
    Hover,
    HoverProvider,
    languages,
    MarkdownString,
    Position,
    TextDocument,
    workspace
} from "vscode";
import { getFilename } from "../util/fileSystem";
import { getPythonMatchAtPosition, getTalonMatchAtPosition, TalonMatchName } from "./matchers";
import { searchInWorkspace } from "./searchInWorkspace";
import { searchInDefaultTalonActions } from "./talonDefaultActions";

abstract class DefinitionProviderBase implements DefinitionProvider {
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

class TalonDefinitionProvider extends DefinitionProviderBase {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getTalonMatchAtPosition(document, position);
    }
}

class PythonDefinitionProvider extends DefinitionProviderBase {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getPythonMatchAtPosition(document, position);
    }
}

abstract class HoverProviderBase implements HoverProvider {
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

        const defaultStrings = searchInDefaultTalonActions(match).map((a) => {
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
            const code = cleanHoverCode(r.targetText);
            return new MarkdownString().appendMarkdown(link).appendCodeblock(code, r.language);
        });

        return new Hover([...defaultStrings, ...userStrings]);
    }

    protected abstract getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined;
}

function cleanHoverCode(text: string): string {
    let lines = text.split(/\r?\n/);
    // Remove talon-list files context
    if (lines[0].startsWith("list:")) {
        const index = lines.findIndex((l) => l.startsWith("-"));
        if (index > -1) {
            lines = lines.slice(index + 1);
        }
    }
    // Remove empty or commented lines
    return lines
        .filter((l) => {
            const lt = l.trimStart();
            return lt !== "" && lt[0] !== "#";
        })
        .join("\n");
}

class TalonHoverProvider extends HoverProviderBase {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getTalonMatchAtPosition(document, position);
    }
}

class PythonHoverProvider extends HoverProviderBase {
    protected getMatchAtPosition(
        document: TextDocument,
        position: Position
    ): TalonMatchName | undefined {
        return getPythonMatchAtPosition(document, position);
    }
}

export function registerLanguageDefinitions(): Disposable {
    return Disposable.from(
        languages.registerDefinitionProvider("talon", new TalonDefinitionProvider()),
        languages.registerDefinitionProvider("python", new PythonDefinitionProvider()),
        languages.registerHoverProvider("talon", new TalonHoverProvider()),
        languages.registerHoverProvider("python", new PythonHoverProvider())
    );
}
