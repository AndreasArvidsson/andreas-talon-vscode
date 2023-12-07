import * as vscode from "vscode";
import type { CommandServerExtension } from "../typings/commandServer";

export class UndoPhrase {
    private disposable: vscode.Disposable;
    private phraseVersion: string | null = null;
    private contentChanges: vscode.TextDocumentContentChangeEvent[] = [];

    constructor(private commandServerExtension: CommandServerExtension) {
        this.disposable = vscode.workspace.onDidChangeTextDocument((event) =>
            this.onDidChangeTextDocument(event)
        );
    }

    undo() {
        console.log(this.contentChanges);
    }

    dispose() {
        this.disposable.dispose();
    }

    private async onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        if (phraseVersion !== this.phraseVersion) {
            this.phraseVersion = phraseVersion;
            this.contentChanges = [];
        }

        this.contentChanges.push(...event.contentChanges);
    }
}
