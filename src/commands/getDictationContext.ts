import { window } from "vscode";

type ReturnValue = { before: string; after: string };

export default (): ReturnValue => {
    const editor = window.activeTextEditor;

    if (!editor || editor.selections.length !== 1) {
        return { before: "", after: "" };
    }

    const startLine = editor.document.lineAt(editor.selection.start);
    const endLine = editor.document.lineAt(editor.selection.end);
    const startChar = editor.selection.start.character;
    const endChar = editor.selection.end.character;

    return {
        before: startLine.text.slice(startChar - 2, startChar),
        after: endLine.text.slice(endChar, endChar + 2),
    };
};
