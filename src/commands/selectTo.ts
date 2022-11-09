import { Selection, window } from "vscode";

export default (lineNumber: number): void => {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    const { start, end } = editor.selection;
    const line = editor.document.lineAt(lineNumber);
    if (line.range.start.isBefore(start)) {
        editor.selection = new Selection(end, line.range.start);
    } else if (line.range.end.isAfter(end)) {
        editor.selection = new Selection(start, line.range.end);
    }
};
