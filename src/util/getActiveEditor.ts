import type { TextEditor } from "vscode";
import { window } from "vscode";

export function getActiveEditor(): TextEditor {
    const editor = window.activeTextEditor;

    if (editor == null) {
        throw Error("Can't find active text editor");
    }

    return editor;
}

export function getActiveFileSchemaEditor(): TextEditor {
    const editor = getActiveEditor();

    if (editor.document.uri.scheme !== "file") {
        throw Error(
            `Active document is not file. Found: ${editor.document.uri.scheme}`,
        );
    }

    return editor;
}
