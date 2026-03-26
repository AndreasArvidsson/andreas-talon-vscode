import { Position, Selection } from "vscode";
import { getActiveEditor } from "../util/getActiveEditor";

export function goToLine(line: number): void {
    const editor = getActiveEditor();

    const documentLine = editor.document.lineAt(line);

    const position = new Position(
        documentLine.lineNumber,
        documentLine.firstNonWhitespaceCharacterIndex,
    );

    const selection = new Selection(position, position);

    editor.selection = selection;
    editor.revealRange(selection);
}
