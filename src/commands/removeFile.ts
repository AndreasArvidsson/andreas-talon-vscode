import * as path from "path";
import { WorkspaceEdit, window, workspace } from "vscode";

export default async (): Promise<void> => {
    const editor = window.activeTextEditor;

    if (editor?.document?.uri.scheme !== "file") {
        throw Error("Can't remove file");
    }

    const uri = editor.document.uri;
    const filename = path.basename(uri.fsPath);

    const remove = await window.showInformationMessage(
        `Are you sure you want to remove '${filename}'?`,
        { modal: true },
        "Remove file"
    );

    if (!remove) {
        return;
    }

    const edit = new WorkspaceEdit();
    edit.deleteFile(uri);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to remove file: ${uri.fsPath}`);
    }
};
