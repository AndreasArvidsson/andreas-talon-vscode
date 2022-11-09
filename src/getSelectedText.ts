import { window } from "vscode";
import getSortedSelections from "./util/getSortedSelections";

export default (): string[] => {
    const editor = window.activeTextEditor;
    if (!editor) {
        return [];
    }

    return getSortedSelections().map((selection) =>
        editor.document.getText(selection)
    );
};
