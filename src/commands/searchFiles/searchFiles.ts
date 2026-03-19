import {
    Disposable,
    languages,
    Position,
    window,
    workspace,
    Selection,
} from "vscode";
import { deleteFile } from "../../util/fileSystem";
import { getActiveEditor } from "../../util/getActiveEditor";
import { languageId } from "./constants";
import { onChangeHandler } from "./onChangeHandler";
import { openNewEditor } from "./openNewEditor";
import { getSelectedLinks, parseDocument } from "./parseDocument";
import { performSearch } from "./performSearch";
import { refreshSearchResultsDocument } from "./refreshSearchResultsDocument";
import { SearchDocumentLinkProvider } from "./SearchDocumentLinkProvider";

export async function searchFiles(query: string = "") {
    const workspaces = await performSearch(query);
    const editor = await openNewEditor();
    await refreshSearchResultsDocument(editor, query, workspaces);
    const postQueryPosition = new Position(0, query.length);
    editor.selections = [new Selection(postQueryPosition, postQueryPosition)];
}

export async function searchFilesToggleSelected() {
    const editor = getActiveEditor();
    const { document, selections } = editor;
    const { query, workspaces } = parseDocument(document);

    for (const ws of workspaces) {
        for (const link of ws.files) {
            if (
                selections.some((sel) => sel.intersection(link.range) != null)
            ) {
                link.selected = !link.selected;
            }
        }
    }

    await refreshSearchResultsDocument(editor, query, workspaces, false);
}

export function searchFilesOpenSelected() {
    return Promise.all(
        getSelectedLinks().map((link) =>
            window.showTextDocument(link.uri, { preview: false }),
        ),
    );
}

export async function searchFilesDeleteSelected() {
    const selectedLinks = getSelectedLinks();

    const remove =
        selectedLinks.length > 0 &&
        (await window.showInformationMessage(
            `Are you sure you want to delete ${selectedLinks.length} files?`,
            { modal: true },
            "Delete files",
        ));

    if (remove) {
        await Promise.all(selectedLinks.map((link) => deleteFile(link.uri)));
    }
}

export function registerSearchFiles(): Disposable {
    return Disposable.from(
        languages.registerDocumentLinkProvider(
            { language: languageId },
            new SearchDocumentLinkProvider(),
        ),
        workspace.onDidChangeTextDocument((event) => {
            if (event.document.languageId === languageId) {
                onChangeHandler();
            }
        }),
    );
}
