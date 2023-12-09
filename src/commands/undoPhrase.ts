import * as vscode from "vscode";
import * as path from "node:path";
import type { CommandServerExtension } from "../typings/commandServer";

interface DocumentHistory {
    version: number;
    text: string;
    editors: {
        editor: vscode.TextEditor;
        selections: readonly vscode.Selection[];
    }[];
}

interface DocumentState {
    history: DocumentHistory[];
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
    private disposable?: vscode.Disposable;
    private documentStates: Map<vscode.Uri, DocumentState> = new Map();
    private phraseStates: PhraseState[] = [];
    private lastState?: PhraseState;
    private undoPhraseVersion?: string;

    constructor(private commandServerExtension: CommandServerExtension) {
        const useUndoPhrase = vscode.workspace
            .getConfiguration("andreas.private")
            .get<boolean>("undoPhrase");

        if (!useUndoPhrase) {
            return;
        }

        this.disposable = vscode.Disposable.from(
            vscode.workspace.onDidChangeTextDocument((event) =>
                this.onDidChangeTextDocument(event)
            ),
            vscode.workspace.onDidOpenTextDocument((document) =>
                this.appendDocumentHistory(document)
            )
        );

        vscode.workspace.textDocuments.forEach((document) => this.appendDocumentHistory(document));
    }

    async undo() {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        if (phraseVersion == null) {
            throw Error("Phrase level undo requires phrase version signal from the command server");
        }

        this.undoPhraseVersion = phraseVersion;
        const phraseState = this.phraseStates.pop();

        console.log("undo", phraseVersion, phraseState?.version);

        if (phraseState == null) {
            return;
        }

        const desiredDocumentVersions = getDesiredDocumentVersions(phraseState);

        for (const { uri, version } of desiredDocumentVersions) {
            const history = this.getDocumentHistory(uri, version);
            if (history != null) {
                await reveredDocument(history);
            }
        }
    }

    dispose() {
        this.disposable?.dispose();
    }

    private getDocumentHistory(uri: vscode.Uri, version: number): DocumentHistory | undefined {
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

        return documentHistory;
    }

    private appendDocumentHistory(document: vscode.TextDocument) {
        if (!this.documentStates.has(document.uri)) {
            this.documentStates.set(document.uri, {
                history: []
            });
        }

        const documentState = this.documentStates.get(document.uri)!;
        const isNewVersion = documentState.history.at(-1)?.version !== document.version;

        if (isNewVersion) {
            console.log(
                "appendDocumentHistory",
                path.basename(document.fileName),
                document.version
            );

            const editors = vscode.window.visibleTextEditors.filter(
                (editor) => editor.document === document
            );

            documentState.history.push({
                version: document.version,
                text: document.getText(),
                editors: editors.map((editor) => ({
                    editor,
                    selections: editor.selections.slice()
                }))
            });
        }
    }

    private appendPhraseHistory(document: vscode.TextDocument, phraseVersion: string) {
        if (this.lastState?.version !== phraseVersion) {
            this.lastState = {
                version: phraseVersion,
                documents: []
            };
            this.phraseStates.push(this.lastState);
        }

        const lastDocument = this.lastState.documents.at(-1);
        const isNewVersion =
            lastDocument?.uri !== document.uri || lastDocument?.version !== document.version;

        if (isNewVersion) {
            console.log(
                "appendPhraseHistory",
                phraseVersion,
                path.basename(document.fileName),
                document.version
            );

            this.lastState.documents.push({
                uri: document.uri,
                version: document.version
            });
        }
    }

    private async onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        // This feature requires phrase version signal from the command server
        if (phraseVersion == null) {
            return;
        }

        const { document } = event;

        console.log(
            "onDidChangeTextDocument",
            phraseVersion,
            path.basename(document.fileName),
            document.version
        );

        this.appendDocumentHistory(document);

        // Don't append undo command phrase
        if (this.undoPhraseVersion !== phraseVersion) {
            this.appendPhraseHistory(document, phraseVersion);
        }
    }
}

function getDesiredDocumentVersions(phraseState: PhraseState): DocumentHistoryUri[] {
    const used = new Set<vscode.Uri>();
    const result: DocumentHistoryUri[] = [];

    for (const { uri, version } of phraseState.documents) {
        // A phrase can contain multiple changes for the same document. We want the document version before the phrase.
        if (!used.has(uri)) {
            used.add(uri);
            result.push({ uri, version: version - 1 });
        }
    }

    return result;
}

async function reveredDocument(documentHistory: DocumentHistory): Promise<void> {
    const { text, editors } = documentHistory;
    const firstEditor = editors[0].editor;
    const { document } = firstEditor;

    if (document.isClosed || document.getText() === text) {
        return;
    }

    const documentRange = new vscode.Range(
        document.lineAt(0).range.start,
        document.lineAt(document.lineCount - 1).range.end
    );

    const wereEditsApplied = await firstEditor.edit((editBuilder) => {
        editBuilder.replace(documentRange, text);
    });

    if (!wereEditsApplied) {
        throw Error("Couldn't apply edits for phrase undo");
    }

    for (const editor of editors) {
        editor.editor.selections = editor.selections;
    }
}
