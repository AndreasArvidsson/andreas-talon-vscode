import { type TextEditor, Position, Range } from "vscode";
import { renderSearchResults } from "./renderSearchResults";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export async function refreshSearchResultsDocument(
    editor: TextEditor,
    workspaces: SearchResultsWorkspace<PartialSearchResultFile>[],
): Promise<void> {
    const { document } = editor;
    const text = renderSearchResults(workspaces);
    await editor.edit((editBuilder) => {
        const range = new Range(
            new Position(0, 0),
            document.lineAt(document.lineCount - 1).range.end,
        );
        editBuilder.replace(range, text);
    });
}
