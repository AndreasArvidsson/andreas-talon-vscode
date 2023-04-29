import { TextEditor, Uri, window } from "vscode";
import { getDir, getFilename } from "./fileSystem";

interface SplitName {
    name: string;
    ext?: string;
}

interface RenameContext {
    uri: Uri;
    dir: string;
    filename: string;
    file: SplitName;
    input?: SplitName;
    selected?: SplitName;
}

export function getNewFilenameContext(inputName?: string): RenameContext | undefined {
    const editor = window.activeTextEditor;

    if (editor?.document?.uri.scheme !== "file") {
        return undefined;
    }

    const uri = editor.document.uri;
    const selected = getSelectedText(editor);
    const filename = getFilename(uri);

    return {
        uri,
        dir: getDir(uri),
        filename,
        file: splitName(filename),
        input: inputName ? splitName(inputName) : undefined,
        selected: selected ? splitName(selected) : undefined
    };
}

function splitName(fullName: string) {
    // Position 1 because we don't want dotfiles
    const i = fullName.indexOf(".", 1);
    const name = i < 0 ? fullName : fullName.substring(0, i);
    const ext = i < 0 ? undefined : fullName.substring(i);
    return {
        name,
        ext
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
