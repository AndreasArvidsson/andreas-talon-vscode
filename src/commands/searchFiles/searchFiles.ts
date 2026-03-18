import { Disposable, languages, window, workspace } from "vscode";
import { deleteFile } from "../../util/fileSystem";
import { getActiveEditor } from "../../util/getActiveEditor";
import { languageId } from "./constants";
import { getQuery } from "./getQuery";
import { onChangeHandler } from "./onChangeHandler";
import { openNewEditor } from "./openNewEditor";
import { getSelectedLinks, parseDocument } from "./parseDocument";
import { performSearch } from "./performSearch";
import { refreshSearchResultsDocument } from "./refreshSearchResultsDocument";
import { SearchDocumentLinkProvider } from "./SearchDocumentLinkProvider";

export async function searchFiles(query?: string) {
    if (!query) {
        query = await getQuery();
        if (!query) {
            return;
        }
    }

    const workspaces = await performSearch(query);
    const editor = await openNewEditor();
    await refreshSearchResultsDocument(editor, query, workspaces);
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

    await refreshSearchResultsDocument(editor, query, workspaces);
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
                onChangeHandler(event.document);
            }
        }),
    );
}
