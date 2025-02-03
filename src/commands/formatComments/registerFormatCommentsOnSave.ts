import * as vscode from "vscode";
import { formatCommentsForEditor } from "./formatComments";
import { configuration } from "../../util/configuration";

export function registerFormatCommentsOnSave(): vscode.Disposable {
    // onWillSaveTextDocument does not tree ge on "Save without formatting"
    return vscode.workspace.onWillSaveTextDocument(async (e) => {
        if (
            e.reason === vscode.TextDocumentSaveReason.Manual &&
            configuration.formatCommentsOnSave(e.document)
        ) {
            const editor = vscode.window.visibleTextEditors.find((e) => e.document === e.document);
            if (editor != null) {
                await formatCommentsForEditor(editor, true);
            }
        }
    });
}
