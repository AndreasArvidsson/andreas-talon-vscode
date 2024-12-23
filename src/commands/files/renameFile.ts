import * as fileSystem from "../../util/fileSystem";
import { getActiveFileSchemaEditor } from "../../util/getActiveEditor";
import { getNewFilenameContext } from "../../util/getRenameContext";
import { showNewNameInputBox } from "../../util/showNewNameInputBox";

export async function renameFile(name?: string): Promise<void> {
    const editor = getActiveFileSchemaEditor();
    const context = getNewFilenameContext(editor, name);

    if (context == null) {
        throw Error("Can't rename file");
    }

    const suggestedName = context.input?.name ?? context.file.name;
    const suggestedExt = context.input?.ext ?? context.file.ext ?? "";

    const filename = await showNewNameInputBox(suggestedName, suggestedExt);

    if (filename && filename !== context.filename) {
        await fileSystem.renameFile(context.uri, filename);
    }
}
