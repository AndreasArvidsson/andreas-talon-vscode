import * as vscode from "vscode";
import * as path from "node:path";
import type { CommandServerExtension } from "../typings/commandServer";

interface DocumentState {
    version: number;
    text: string;
    editors: {
        editor: vscode.TextEditor;
        selections: readonly vscode.Selection[];
    }[];
}

interface PhraseState {
    version: string;
    documents: Map<vscode.Uri, DocumentState>;
}

const HISTORY_MAX_LENGTH = 10;

export class UndoPhrase {
    private disposable?: vscode.Disposable;
    private documentStates: Map<vscode.Uri, DocumentState> = new Map();
    private phraseStates: PhraseState[] = [];
    private lastState: PhraseState = { version: "", documents: new Map() };
    private undoPhraseVersion?: string;

    constructor(private commandServerExtension: CommandServerExtension) {
        const useUndoPhrase = vscode.workspace
            .getConfiguration("andreas.private")
            .get<boolean>("undoPhrase");

        if (!useUndoPhrase) {
            return;
        }

        vscode.workspace.textDocuments.forEach((document) => this.updateDocumentState(document));

        this.disposable = vscode.Disposable.from(
            vscode.workspace.onDidChangeTextDocument((event) =>
                this.onDidChangeTextDocument(event)
            ),
            vscode.workspace.onDidOpenTextDocument((document) =>
                this.updateDocumentState(document)
            ),
            vscode.workspace.onDidCloseTextDocument((document) => {
                this.documentStates.delete(document.uri);
            })
        );
    }

    private updateDocumentState(document: vscode.TextDocument) {
        if (this.documentStates.get(document.uri)?.version === document.version) {
            return;
        }

        console.log("updateDocumentState", path.basename(document.fileName), document.version);

        this.documentStates.set(document.uri, {
            version: document.version,
            text: document.getText(),
            editors: vscode.window.visibleTextEditors
                .filter((editor) => editor.document === document)
                .map((editor) => ({
                    editor,
                    selections: editor.selections.slice()
                }))
        });
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

        this.appendPhraseHistory(document, phraseVersion);

        this.updateDocumentState(document);
    }

    private appendPhraseHistory(document: vscode.TextDocument, phraseVersion: string) {
        // Don't append undo command phrase
        if (this.undoPhraseVersion === phraseVersion) {
            return;
        }

        console.log(
            "appendPhraseHistory",
            phraseVersion,
            path.basename(document.fileName),
            document.version
        );

        // Start of new phrase
        if (this.lastState?.version !== phraseVersion) {
            this.lastState = {
                version: phraseVersion,
                documents: new Map()
            };
            this.phraseStates.push(this.lastState);

            if (this.phraseStates.length > HISTORY_MAX_LENGTH) {
                this.phraseStates.shift();
            }
        }

        // We want to catch the document state before the phrase/first change
        if (this.lastState.documents.has(document.uri)) {
            return;
        }

        const documentState = this.documentStates.get(document.uri);

        if (documentState == null) {
            void vscode.window.showErrorMessage(
                `Can't find previous document state: ${document.uri.toString()}`
            );
            return;
        }

        if (documentState.version !== document.version - 1) {
            void vscode.window.showErrorMessage(
                `Expected previous document state version to be ${document.version - 1} but was ${
                    documentState.version
                }`
            );
            return;
        }

        this.lastState.documents.set(document.uri, documentState);
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

        for (const documentState of phraseState.documents.values()) {
            await reveredDocument(documentState);
        }
    }

    dispose() {
        this.disposable?.dispose();
    }
}

async function reveredDocument(documentState: DocumentState): Promise<void> {
    const editors = documentState.editors.filter((editor) =>
        vscode.window.visibleTextEditors.includes(editor.editor)
    );

    if (editors.length === 0) {
        return;
    }

    const firstEditor = editors[0].editor;
    const { document } = firstEditor;

    const documentRange = new vscode.Range(
        document.lineAt(0).range.start,
        document.lineAt(document.lineCount - 1).range.end
    );

    const wereEditsApplied = await firstEditor.edit((editBuilder) => {
        editBuilder.replace(documentRange, documentState.text);
    });

    if (!wereEditsApplied) {
        throw Error("Couldn't apply edits for phrase undo");
    }

    for (const editor of editors) {
        editor.editor.selections = editor.selections;
    }
}
