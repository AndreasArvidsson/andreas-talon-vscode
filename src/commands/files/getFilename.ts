import { getFilename as fsGetFilename } from "../../util/fileSystem";
import { getActiveEditor } from "../../util/getActiveEditor";

export function getFilename(): string {
    const editor = getActiveEditor();
    const uri = editor.document.uri;

    return uri.scheme === "file" ? fsGetFilename(uri) : uri.fsPath;
}
