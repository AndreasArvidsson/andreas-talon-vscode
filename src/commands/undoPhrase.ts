import * as vscode from "vscode";
import type { CommandServerExtension } from "../typings/commandServer";

interface DocumentState {
    document: vscode.TextDocument;
    text: string;
}

interface PhraseState {
    version: string;
    documents: DocumentState[];
}

const maxLimit = 10;

export class UndoPhrase {
    private disposable: vscode.Disposable;
    private phraseStates: PhraseState[] = [];
    private lastState?: PhraseState;
    private timeout?: NodeJS.Timeout;

    constructor(private commandServerExtension: CommandServerExtension) {
        this.disposable = vscode.Disposable.from(
            vscode.workspace.onDidChangeTextDocument((event) =>
                this.onDidChangeTextDocument(event)
            ),
            vscode.workspace.onDidOpenTextDocument((document) => this.storeState(document))
        );
    }

    async undo() {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        console.log("undo", phraseVersion);

        if (phraseVersion == null) {
            throw Error("Phrase level undo requires phrase version signal from the command server");
        }

        console.log(this.phraseStates);

        // The last state is the current state so we need to go back one more
        this.phraseStates.pop();
        const phraseState = this.phraseStates.at(-1);

        if (phraseState == null) {
            return;
        }

        for (const state of phraseState.documents) {
            await restoreDocumentState(state);
        }
    }

    dispose() {
        this.disposable.dispose();
    }

    private onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => void this.storeState(event.document), 32);
    }

    private async storeState(document: vscode.TextDocument) {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        console.log("storeState", phraseVersion);

        // This feature requires phrase version signal from the command server
        if (phraseVersion == null) {
            return;
        }

        if (this.lastState?.version !== phraseVersion) {
            this.lastState = {
                version: phraseVersion,
                documents: []
            };

            this.phraseStates.push(this.lastState);

            // Remove oldest state if we've reached the limit
            if (this.phraseStates.length > maxLimit) {
                this.phraseStates.shift();
            }
        }

        // Remove previous document state if it exists
        this.lastState.documents = this.lastState.documents.filter(
            (documentState) => documentState.document !== document
        );

        // Add current document state
        this.lastState.documents.push({
            document,
            text: document.getText()
        });
    }
}

async function restoreDocumentState(documentState: DocumentState): Promise<void> {
    const { document, text } = documentState;

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
