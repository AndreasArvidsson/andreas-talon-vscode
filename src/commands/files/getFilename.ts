import path from "node:path";
import { window } from "vscode";

export function getFilename(): string {
    const editor = window.activeTextEditor;
    const fsPath = editor?.document.uri.fsPath;

    if (!fsPath) {
        throw Error("Can't get filename");
    }

    return path.basename(fsPath);
}
