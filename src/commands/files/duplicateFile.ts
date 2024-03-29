import path from "node:path";
import { Uri } from "vscode";
import { copyFile, openTextDocument } from "../../util/fileSystem";
import { getNewFilenameContext } from "../../util/getRenameContext";
import { showNewNameInputBox } from "../../util/showNewNameInputBox";

export async function duplicateFile(name?: string): Promise<void> {
    const context = getNewFilenameContext(name);

    if (!context) {
        throw Error("Can't duplicate file");
    }

    const suggestedName = context.input?.name ?? context.file.name;
    const suggestedExt = context.input?.ext ?? context.file.ext ?? "";

    const filename = await showNewNameInputBox(suggestedName, suggestedExt);

    if (filename) {
        const uri = Uri.file(path.join(context.dir, filename));
        await copyFile(context.uri, uri);
        await openTextDocument(uri);
    }
}
