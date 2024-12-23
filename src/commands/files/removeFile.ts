import { window } from "vscode";
import { deleteFile, getFilename } from "../../util/fileSystem";
import { getActiveFileSchemaEditor } from "../../util/getActiveEditor";

export async function removeFile(): Promise<void> {
    const editor = getActiveFileSchemaEditor();
    const uri = editor.document.uri;
    const filename = getFilename(uri);

    const remove = await window.showInformationMessage(
        `Are you sure you want to remove '${filename}'?`,
        { modal: true },
        "Remove file"
    );

    if (remove) {
        await deleteFile(uri);
    }
}
