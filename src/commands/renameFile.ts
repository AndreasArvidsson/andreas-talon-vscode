import * as fs from "fs";
import * as path from "path";
import { Uri, WorkspaceEdit, window, workspace } from "vscode";
import { getRenameContext } from "../util/getRenameContext";

export default async (name?: string): Promise<void> => {
    const context = getRenameContext(name);

    if (!context) {
        throw Error("Can't rename file");
    }

    const suggestedName = context.input?.name ?? context.file.name;
    const suggestedExt = context.input?.ext ?? context.file.ext ?? "";
    const value = `${suggestedName}${suggestedExt}`;

    const filename = await window.showInputBox({
        prompt: "New name",
        value,
        valueSelection: [0, suggestedName.length],
        ignoreFocusOut: true,
    });

    if (!filename || filename === value) {
        return;
    }

    const file = path.join(context.dir, filename);
    const uri = Uri.file(file);

    if (fs.existsSync(file)) {
        throw Error(`File '${filename}' already exists`);
    }

    const edit = new WorkspaceEdit();
    edit.renameFile(context.uri, uri);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to rename file: ${context.uri.fsPath}`);
    }
};
