import path from "node:path";
import { Uri } from "vscode";
import { copyFile, openTextDocument } from "../../util/fileSystem";
import { getActiveFileSchemaEditor } from "../../util/getActiveEditor";
import { getNewFilenameContext } from "../../util/getRenameContext";
import { showNewNameInputBox } from "../../util/showNewNameInputBox";

export async function duplicateFile(name?: string): Promise<void> {
    const editor = getActiveFileSchemaEditor();
    const context = getNewFilenameContext(editor, name);

    if (context == null) {
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
