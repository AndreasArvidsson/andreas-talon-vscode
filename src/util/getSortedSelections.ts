import { Selection, TextEditor } from "vscode";

export default (editor: TextEditor): Selection[] => {
    return editor.selections.slice().sort((a, b) => a.start.compareTo(b.start));
};
