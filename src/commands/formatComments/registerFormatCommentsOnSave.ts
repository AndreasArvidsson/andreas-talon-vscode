import * as vscode from "vscode";
import { configuration } from "../../util/configuration";
import { formatCommentsRunner } from "./formatComments";

export function registerFormatCommentsOnSave(): vscode.Disposable {
    // onWillSaveTextDocument does not tree ge on "Save without formatting"
    return vscode.workspace.onWillSaveTextDocument(async (e) => {
        if (
            e.reason === vscode.TextDocumentSaveReason.Manual &&
            configuration.formatCommentsOnSave(e.document)
        ) {
            const editor = vscode.window.visibleTextEditors.find((e) => e.document === e.document);
            if (editor != null) {
                await formatCommentsRunner({ editor, doSave: true });
            }
        }
    });
}
