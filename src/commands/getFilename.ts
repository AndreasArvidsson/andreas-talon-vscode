import { window } from "vscode";
import * as path from "path";

export default (): string => {
    const editor = window.activeTextEditor;

    if (!editor?.document.uri.fsPath) {
        throw Error("Can't get filename");
    }

    return path.basename(editor.document.uri.fsPath);
};
