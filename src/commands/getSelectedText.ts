import { window } from "vscode";
import { getSortedSelections } from "../util/getSortedSelections";

export function getSelectedText(): string[] {
    const editor = window.activeTextEditor;

    if (!editor) {
        return [];
    }

    return getSortedSelections(editor).map((selection) => editor.document.getText(selection));
}

export function getDocumentText(): string {
    const editor = window.activeTextEditor;

    if (!editor) {
        return "";
    }

    return editor.document.getText();
}
