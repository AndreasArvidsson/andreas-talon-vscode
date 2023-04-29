import * as fileSystem from "../../util/fileSystem";
import { getNewFilenameContext } from "../../util/getRenameContext";
import { showNewNameInputBox } from "../../util/showNewNameInputBox";

export async function renameFile(name?: string): Promise<void> {
    const context = getNewFilenameContext(name);

    if (!context) {
        throw Error("Can't rename file");
    }

    const suggestedName = context.input?.name ?? context.file.name;
    const suggestedExt = context.input?.ext ?? context.file.ext ?? "";

    const filename = await showNewNameInputBox(suggestedName, suggestedExt);

    if (filename && filename !== context.filename) {
        fileSystem.renameFile(context.uri, filename);
    }
}
