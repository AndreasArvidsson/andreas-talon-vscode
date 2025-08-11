import * as path from "node:path";
import * as vscode from "vscode";
import { createFile } from "../../util/fileSystem";
import { getNewFilenameContext } from "../../util/getRenameContext";
import { showNewNameInputBox } from "../../util/showNewNameInputBox";

export async function newFile(name?: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    const context =
        editor != null ? getNewFilenameContext(editor, name) : undefined;

    if (context == null) {
        await vscode.commands.executeCommand("explorer.newFile");
        return;
    }

    const input = context.input ?? context.selected;
    const suggestedName = input?.name ?? "";
    const suggestedExt = input?.ext ?? context.file.ext ?? "";

    const filename = await showNewNameInputBox(suggestedName, suggestedExt);

    if (filename) {
        const uri = vscode.Uri.file(path.join(context.dir, filename));
        await createFile(uri);
        await vscode.window.showTextDocument(uri);
    }
}
