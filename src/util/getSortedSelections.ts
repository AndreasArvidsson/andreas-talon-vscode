import type { Selection, TextEditor } from "vscode";

export function getSortedSelections(editor: TextEditor): Selection[] {
    return editor.selections.slice().sort((a, b) => a.start.compareTo(b.start));
}
