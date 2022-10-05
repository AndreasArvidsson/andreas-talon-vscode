import { Selection, window } from "vscode";
import getSortedSelections from "./util/getSortedSelections";

export default async (start: number = 0) => {
    const editor = window.activeTextEditor;

    if (!editor) {
        return;
    }

    const offsets: number[] = [];

    // This is the delta in offset due to changes earlier in the document.
    let offsetDelta = 0;

    const wereEditsApplied = await editor.edit((editBuilder) => {
        getSortedSelections().forEach((selection, i) => {
            const offsetStart = editor.document.offsetAt(selection.start);
            const offsetEnd = editor.document.offsetAt(selection.end);
            const text = (start + i).toString();
            offsets.push(offsetStart + text.length + offsetDelta);
            offsetDelta += text.length - (offsetEnd - offsetStart);
            editBuilder.replace(selection, text);
        });
    });

    if (!wereEditsApplied) {
        throw Error("Couldn't apply edits for generate range");
    }

    editor.selections = offsets.map((offset) => {
        const position = editor.document.positionAt(offset);
        return new Selection(position, position);
    });
};
