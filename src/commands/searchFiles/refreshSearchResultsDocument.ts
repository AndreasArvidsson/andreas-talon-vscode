import { Position, Range, type TextEditor } from "vscode";
import { renderSearchResults } from "./renderSearchResults";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

let selectedFiles: Set<string> = new Set();

export async function refreshSearchResultsDocument(
    editor: TextEditor,
    query: string,
    workspaces: SearchResultsWorkspace<PartialSearchResultFile>[],
    keepFileSelections: boolean = true,
): Promise<void> {
    // Keep track of selected files across refreshes by their workspace name and file path
    if (keepFileSelections) {
        for (const ws of workspaces) {
            for (const file of ws.files) {
                if (selectedFiles.has(`${ws.name}/${file.path}`)) {
                    file.selected = true;
                }
            }
        }
    }

    const text = renderSearchResults(query, workspaces);
    const selections = editor.selections;
    const { document } = editor;

    await editor.edit((editBuilder) => {
        const range = new Range(
            new Position(0, 0),
            document.lineAt(document.lineCount - 1).range.end,
        );
        editBuilder.replace(range, text);
    });

    editor.selections = selections;

    selectedFiles = new Set(
        workspaces.flatMap((ws) =>
            ws.files
                .filter((file) => file.selected)
                .map((file) => `${ws.name}/${file.path}`),
        ),
    );
}
