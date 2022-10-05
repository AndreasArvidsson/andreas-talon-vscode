import { Selection, window } from "vscode";

export default (): Selection[] => {
    const editor = window.activeTextEditor;
    if (!editor) {
        return [];
    }
    return editor.selections.slice().sort((a, b) => a.start.compareTo(b.start));
};
