import { window } from "vscode";
import * as path from "path";

export function getFilename(): string {
    const editor = window.activeTextEditor;
    const fsPath = editor?.document.uri.fsPath;

    if (!fsPath) {
        throw Error("Can't get filename");
    }

    return path.basename(fsPath);
}
