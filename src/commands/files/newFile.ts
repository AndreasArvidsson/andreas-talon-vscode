import * as path from "path";
import { Uri, commands } from "vscode";
import { showNewNameInputBox } from "../../util/showNewNameInputBox";
import { createFile, openTextDocument } from "../../util/fileSystem";
import { getNewFilenameContext } from "../../util/getRenameContext";

export async function newFile(name?: string): Promise<void> {
    const context = getNewFilenameContext(name);

    if (!context) {
        await commands.executeCommand("explorer.newFile");
        return;
    }

    const input = context.input ?? context.selected;
    const suggestedName = input?.name ?? "";
    const suggestedExt = input?.ext ?? context.file.ext ?? "";

    const filename = await showNewNameInputBox(suggestedName, suggestedExt);

    if (filename) {
        const uri = Uri.file(path.join(context.dir, filename));
        await createFile(uri);
        await openTextDocument(uri);
    }
}
