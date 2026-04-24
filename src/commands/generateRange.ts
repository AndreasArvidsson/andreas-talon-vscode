import { Selection } from "vscode";
import { getActiveEditor } from "../util/getActiveEditor";
import { getSortedSelections } from "../util/getSortedSelections";

export async function generateRange(start = 1): Promise<void> {
    const editor = getActiveEditor();

    const wereEditsApplied = await editor.edit((editBuilder) => {
        for (const [i, selection] of getSortedSelections(editor).entries()) {
            const text = (start + i).toString();
            editBuilder.replace(selection, text);
        }
    });

    if (!wereEditsApplied) {
        throw new Error("Couldn't apply edits for generate range");
    }

    // Replace edits will select the new content. Move selection after.
    editor.selections = editor.selections.map(
        (selection) => new Selection(selection.end, selection.end),
    );
}
