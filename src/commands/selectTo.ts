import { Selection, window } from "vscode";

export async function selectTo(lineNumber?: number): Promise<void> {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    if (lineNumber == null) {
        lineNumber = await showInputBox();
        if (lineNumber == null) {
            console.warn("Can't select to: Missing line number argument.");
            return;
        }
    }

    const { start, end } = editor.selection;
    const line = editor.document.lineAt(lineNumber);
    if (line.range.start.isBefore(start)) {
        editor.selection = new Selection(end, line.range.start);
    } else if (line.range.end.isAfter(end)) {
        editor.selection = new Selection(start, line.range.end);
    }
}

async function showInputBox(): Promise<number | undefined> {
    const value = await window.showInputBox({
        placeHolder: "Line number (0 offset)",
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (/^\d+$/.test(value.trim())) {
                return null;
            }
            return "Must be positive integer";
        }
    });
    if (value != null) {
        return parseInt(value.trim());
    }
    return undefined;
}
