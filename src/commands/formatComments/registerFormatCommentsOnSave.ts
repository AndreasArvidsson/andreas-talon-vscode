import * as vscode from "vscode";
import { formatCommentsForEditor } from "./formatComments";

const settingSection = "andreas";
const settingName = "formatCommentsOnSave";

export function registerFormatCommentsOnSave(): vscode.Disposable {
    // onWillSaveTextDocument does not tree ge on "Save without formatting"
    return vscode.workspace.onWillSaveTextDocument(async () => {
        if (!readSetting()) {
            return;
        }
        const editor = vscode.window.visibleTextEditors.find((e) => e.document === e.document);
        if (editor != null) {
            await formatCommentsForEditor(editor, true);
        }
    });
}

function readSetting(): boolean {
    return vscode.workspace.getConfiguration(settingSection).get<boolean>(settingName, false);
}
