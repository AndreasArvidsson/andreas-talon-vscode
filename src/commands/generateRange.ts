import { Selection, window } from "vscode";
import getSortedSelections from "../util/getSortedSelections";

export default async (start = 1): Promise<void> => {
    const editor = window.activeTextEditor;

    if (!editor) {
        return;
    }

    const wereEditsApplied = await editor.edit((editBuilder) => {
        getSortedSelections(editor).forEach((selection, i) => {
            const text = (start + i).toString();
            editBuilder.replace(selection, text);
        });
    });

    if (!wereEditsApplied) {
        throw Error("Couldn't apply edits for generate range");
    }

    // Replace edits will select the new content. Move selection after.
    editor.selections = editor.selections.map(
        (selection) => new Selection(selection.end, selection.end)
    );
};
