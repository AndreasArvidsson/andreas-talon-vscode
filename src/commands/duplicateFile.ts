import * as path from "path";
import { Uri } from "vscode";
import { showNewNameInputBox } from "../util/showNewNameInputBox";
import { copyFile, openTextDocument } from "../util/fileSystem";
import { getNewFilenameContext } from "../util/getRenameContext";

export async function duplicateFile(name?: string): Promise<void> {
    const context = getNewFilenameContext(name);

    if (!context) {
        throw Error("Can't duplicate file");
    }

    const suggestedName = context.input?.name ?? "";
    const suggestedExt = context.input?.ext ?? context.file.ext ?? "";

    const filename = await showNewNameInputBox(suggestedName, suggestedExt);

    if (filename) {
        const uri = Uri.file(path.join(context.dir, filename));
        await copyFile(context.uri, uri);
        await openTextDocument(uri);
    }
}
