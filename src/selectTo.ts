import { window, Selection, Position } from "vscode";

export default (lineNumber: number) => {
    const editor = window.activeTextEditor!;
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
