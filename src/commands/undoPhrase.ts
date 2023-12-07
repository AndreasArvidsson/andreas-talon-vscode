import * as vscode from "vscode";
import type { CommandServerExtension } from "../typings/commandServer";

interface DocumentState {
    document: vscode.TextDocument;
    history: {
        version: number;
        text: string;
    }[];
}

interface DocumentHistoryUri {
    uri: vscode.Uri;
    version: number;
}

interface PhraseState {
    version: string;
    documents: DocumentHistoryUri[];
}

export class UndoPhrase {
    private disposable: vscode.Disposable;
    private documentStates: Map<vscode.Uri, DocumentState> = new Map();
    private phraseStates: PhraseState[] = [];
    private lastState?: PhraseState;
    private undoPhraseVersion?: string;

    constructor(private commandServerExtension: CommandServerExtension) {
        this.disposable = vscode.Disposable.from(
            vscode.workspace.onDidChangeTextDocument((event) =>
                this.onDidChangeTextDocument(event)
            ),
            vscode.workspace.onDidOpenTextDocument((document) =>
                this.appendDocumentHistory(document)
            )
        );
    }

    async undo() {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        console.log("undo", phraseVersion);

        if (phraseVersion == null) {
            throw Error("Phrase level undo requires phrase version signal from the command server");
        }

        this.undoPhraseVersion = phraseVersion;
        const phraseState = this.phraseStates.pop();

        console.log("undo state", phraseState?.version);

        if (phraseState == null) {
            return;
        }

        const documentVersions = getDesiredDocumentVersions(phraseState);

        for (const { uri, version } of documentVersions) {
            const history = this.getDocumentHistory(uri, version);
            // console.log("restore", uri.toString(), version);
            // console.log(history);
            if (history != null) {
                await restoreDocumentState(history.document, history.text);
            }
        }
    }

    dispose() {
        this.disposable.dispose();
    }

    private getDocumentHistory(uri: vscode.Uri, version: number) {
        const documentState = this.documentStates.get(uri);

        if (documentState == null) {
            throw Error(`Can't find document state: ${uri.toString()}`);
        }

        // We don't have a version this old
        if (version < documentState.history[0].version) {
            return undefined;
        }

        const documentHistory = documentState.history.findLast(
            (history) => history.version === version
        );

        if (documentHistory == null) {
            throw Error(`Can't find document history: ${uri.toString()}, ${version}`);
        }

        return { document: documentState.document, text: documentHistory.text };
    }

    private appendDocumentHistory(document: vscode.TextDocument) {
        console.log("appendDocumentHistory", document.uri.toString(), document.version);

        if (!this.documentStates.has(document.uri)) {
            this.documentStates.set(document.uri, {
                document,
                history: []
            });
        }

        this.documentStates.get(document.uri)!.history.push({
            version: document.version,
            text: document.getText()
        });
    }

    private appendPhraseHistory(document: vscode.TextDocument, phraseVersion: string) {
        console.log(
            "appendPhraseHistory",
            phraseVersion,
            document.uri.toString(),
            document.version
        );

        if (this.lastState?.version !== phraseVersion) {
            this.lastState = {
                version: phraseVersion,
                documents: []
            };
            this.phraseStates.push(this.lastState);
        }

        this.lastState.documents.push({
            uri: document.uri,
            version: document.version
        });
    }

    private async onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        // This feature requires phrase version signal from the command server
        if (phraseVersion == null) {
            return;
        }

        const { document } = event;

        console.log("onDidChangeTextDocument", phraseVersion, document.uri.toString());

        this.appendDocumentHistory(document);

        // Don't append undo command phrase
        if (this.undoPhraseVersion !== phraseVersion) {
            this.appendPhraseHistory(document, phraseVersion);
        }
    }
}

function getDesiredDocumentVersions(phraseState: PhraseState): DocumentHistoryUri[] {
    const lowestVersions = new Map<vscode.Uri, number>();

    for (const { uri, version } of phraseState.documents) {
        const lowersVersion = Math.min(lowestVersions.get(uri) ?? Infinity, version);
        lowestVersions.set(uri, lowersVersion);
    }

    return Array.from(lowestVersions.entries()).map(([uri, version]) => ({
        uri,
        version: version - 1
    }));
}

async function restoreDocumentState(document: vscode.TextDocument, text: string): Promise<void> {
    console.log(text);

    if (document.isClosed || document.getText() === text) {
        return;
    }

    const editor = getEditorForDocument(document);

    const documentRange = new vscode.Range(
        document.lineAt(0).range.start,
        document.lineAt(document.lineCount - 1).range.end
    );

    const wereEditsApplied = await editor.edit((editBuilder) => {
        editBuilder.replace(documentRange, text);
    });

    if (!wereEditsApplied) {
        throw Error("Couldn't apply edits for phrase undo");
    }
}

function getEditorForDocument(document: vscode.TextDocument): vscode.TextEditor {
    const editor = vscode.window.visibleTextEditors.find((editor) => editor.document === document);

    if (!editor) {
        throw Error(`Couldn't find editor for document: ${document.uri.toString()}`);
    }

    return editor;
}
