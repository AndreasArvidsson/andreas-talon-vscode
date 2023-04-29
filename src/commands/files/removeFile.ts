import { window } from "vscode";
import { deleteFile } from "../../util/fileSystem";
import { getFilename } from "../../util/fileSystem";

export async function removeFile(): Promise<void> {
    const editor = window.activeTextEditor;

    if (editor?.document?.uri.scheme !== "file") {
        throw Error("Can't remove file");
    }

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
