import { Selection } from "vscode";
import { getActiveEditor } from "../util/getActiveEditor";

export function lineMiddle(): void {
    const editor = getActiveEditor();

    editor.selections = editor.selections.map((selection) => {
        const line = editor.document.lineAt(selection.active.line);
        let start, end;
        if (line.isEmptyOrWhitespace) {
            start = 0;
            end = line.text.length;
        } else {
            start = line.firstNonWhitespaceCharacterIndex;
            end = start + line.text.trim().length;
        }
        const middle = Math.floor((start + end) / 2);
        return new Selection(line.lineNumber, middle, line.lineNumber, middle);
    });
}
