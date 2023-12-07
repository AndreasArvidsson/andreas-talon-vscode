import * as vscode from "vscode";
import type { CommandServerExtension } from "../typings/commandServer";

export class UndoPhrase {
    private disposable: vscode.Disposable;
    private phraseVersion: string | null = null;
    private changeEvents: vscode.TextDocumentChangeEvent[] = [];

    constructor(private commandServerExtension: CommandServerExtension) {
        this.disposable = vscode.workspace.onDidChangeTextDocument((event) =>
            this.onDidChangeTextDocument(event)
        );
    }

    async undo() {
        console.log(this.changeEvents);
        // await vscode.commands.executeCommand("undo");

        await Promise.all(this.changeEvents.map((event) => {}));
    }

    // const wereEditsApplied = await editor.edit((editBuilder) => {
    //     getSortedSelections(editor).forEach((selection, i) => {
    //         const text = (start + i).toString();
    //         editBuilder.replace(selection, text);
    //     });
    // });

    // if (!wereEditsApplied) {
    //     throw Error("Couldn't apply edits for generate range");
    // }

    dispose() {
        this.disposable.dispose();
    }

    private async onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent) {
        const phraseVersion = await this.commandServerExtension.signals.prePhrase.getVersion();

        if (event.reason === vscode.TextDocumentChangeReason.Undo) {
            console.log("undo");
        } else {
            console.log("change");
        }
        event.contentChanges.forEach((change) => {
            console.log(`'${change.text}'`);
            console.log(change.rangeOffset, change.rangeLength);
        });

        if (phraseVersion !== this.phraseVersion) {
            this.phraseVersion = phraseVersion;
            this.changeEvents = [];
        }

        this.changeEvents.push(event);
    }
}
