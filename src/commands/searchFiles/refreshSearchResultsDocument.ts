import { Position, Range, type TextEditor } from "vscode";
import { renderSearchResults } from "./renderSearchResults";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";
import { parseDocument } from "./parseDocument";

export let lastQuery = "";

export async function refreshSearchResultsDocument(
    editor: TextEditor,
    query: string,
    workspaces: SearchResultsWorkspace<PartialSearchResultFile>[],
    keepFileSelections: boolean = true,
): Promise<void> {
    lastQuery = query;

    if (keepFileSelections) {
        applyCurrentFileSelection(editor, workspaces);
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
}

// Keep track of selected files across refreshes by their workspace name and file path
function applyCurrentFileSelection(
    editor: TextEditor,
    workspaces: SearchResultsWorkspace<PartialSearchResultFile>[],
) {
    const currentWorkspaces = parseDocument(editor.document).workspaces;

    for (const ws of workspaces) {
        const currentWs = currentWorkspaces.find((cws) => cws.name === ws.name);
        if (currentWs == null) {
            continue;
        }
        const selectedFiles = new Set(
            currentWs.files
                .filter((file) => file.selected)
                .map((file) => file.path),
        );
        for (const file of ws.files) {
            if (selectedFiles.has(file.path)) {
                file.selected = true;
            }
        }
    }
}
