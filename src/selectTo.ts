import { window, Selection, Position } from "vscode";

export default (lineNumber: number): void => {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    --lineNumber;
    const position = editor.selection.active;
    if (position.line === lineNumber) {
        return;
    }
    const character = lineNumber > position.line ? 1000 : 0;
    editor.selection = new Selection(
        position,
        new Position(lineNumber, character)
    );
};
