import { window } from "vscode";
import { getFilename as fsGetFilename } from "../../util/fileSystem";

export function getFilename(): string {
    const uri = window.activeTextEditor?.document.uri;

    if (!uri) {
        throw Error("Can't get filename");
    }

    return fsGetFilename(uri);
}
