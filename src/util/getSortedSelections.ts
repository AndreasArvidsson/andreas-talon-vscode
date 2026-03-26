import type { Selection, TextEditor } from "vscode";

export function getSortedSelections(editor: TextEditor): Selection[] {
    return editor.selections.slice().toSorted((a, b) => a.start.compareTo(b.start));
}
