import { TextEditor, Uri } from "vscode";
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

export function getNewFilenameContext(
    editor: TextEditor,
    inputName?: string
): RenameContext | undefined {
    if (editor.document.uri.scheme !== "file") {
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

export function splitName(fullName: string) {
    const i = fullName.lastIndexOf(".");

    // Skip index 0 because we don't want dotfiles
    if (i < 1) {
        return {
            name: fullName
        };
    }

    let name = fullName.substring(0, i);
    let ext = fullName.substring(i);

    // For convenience treat .test as part of the extension
    if (name.endsWith(".test")) {
        const i2 = name.lastIndexOf(".", i - 1);
        if (i2 > 0) {
            name = name.substring(0, i2);
            ext = fullName.substring(i2);
        }
    }

    return { name, ext };
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
