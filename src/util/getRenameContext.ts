import * as path from "path";
import { TextEditor, Uri, window } from "vscode";

interface SplitName {
    name: string;
    ext?: string;
}

interface RenameContext {
    uri: Uri;
    dir: string;
    file: SplitName;
    input?: SplitName;
    selected?: SplitName;
}

export function getRenameContext(
    inputName?: string
): RenameContext | undefined {
    const editor = window.activeTextEditor;

    if (editor?.document?.uri.scheme !== "file") {
        return undefined;
    }

    const uri = editor.document.uri;
    const selected = getSelectedText(editor);

    return {
        uri,
        dir: path.dirname(uri.fsPath),
        file: splitName(path.basename(uri.fsPath)),
        input: inputName ? splitName(inputName) : undefined,
        selected: selected ? splitName(selected) : undefined,
    };
}

function splitName(fullName: string) {
    // Position 1 because we don't want dotfiles
    const i = fullName.indexOf(".", 1);
    const name = i < 0 ? fullName : fullName.substring(0, i);
    const ext = i < 0 ? undefined : fullName.substring(i);
    return {
        name,
        ext,
    };
}

function getSelectedText(editor?: TextEditor): string {
    if (editor?.selections.length !== 1) {
        return "";
    }
    const selectedText = editor.document.getText(editor.selection);
    if (/^[ \w\d-.]+$/.test(selectedText)) {
        return selectedText;
    }
    return "";
}
