import * as fs from "fs";
import * as path from "path";
import { Uri, WorkspaceEdit, commands, window, workspace } from "vscode";
import { getRenameContext } from "../util/getRenameContext";

export default async (name?: string): Promise<void> => {
    const context = getRenameContext(name);

    if (!context) {
        await commands.executeCommand("explorer.newFile");
        return;
    }

    const input = context.input ?? context.selected;
    const suggestedName = input?.name ?? "";
    const suggestedExt = input?.ext ?? context.file.ext ?? "";

    const filename = await window.showInputBox({
        prompt: "New name",
        value: `${suggestedName}${suggestedExt}`,
        valueSelection: [0, suggestedName.length],
        ignoreFocusOut: true,
    });

    if (!filename) {
        return;
    }

    const file = path.join(context.dir, filename);
    const uri = Uri.file(file);

    if (fs.existsSync(file)) {
        throw Error(`File '${filename}' already exists`);
    }

    const edit = new WorkspaceEdit();
    edit.createFile(uri);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to create file: ${uri.fsPath}`);
    }

    const document = await workspace.openTextDocument(uri);

    await window.showTextDocument(document);
};
