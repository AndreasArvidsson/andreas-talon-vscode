import { Position, Selection, window } from "vscode";

export function goToLine(line: number): void {
    const editor = window.activeTextEditor;

    if (!editor) {
        return;
    }

    const documentLine = editor.document.lineAt(line);

    if (!documentLine) {
        throw Error(`No line ${line} in document`);
    }

    const position = new Position(
        documentLine.lineNumber,
        documentLine.firstNonWhitespaceCharacterIndex
    );

    editor.selection = new Selection(position, position);
}
