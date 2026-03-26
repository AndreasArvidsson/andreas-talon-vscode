import { window } from "vscode";
import { Debouncer } from "../../util/debounce";
import { languageId } from "./constants";
import { parseDocument } from "./parseDocument";
import { performSearch } from "./performSearch";
import {
    lastQuery,
    refreshSearchResultsDocument,
} from "./refreshSearchResultsDocument";

const debouncer = new Debouncer(() => {
    performUpdate().catch(console.error);
}, 500);

export function onChangeHandler(): void {
    debouncer.run();
}

async function performUpdate(): Promise<void> {
    // There can only be one search editor, so we can just find the first visible editor with the correct language ID
    const editor = window.visibleTextEditors.find(
        (e) => e.document.languageId === languageId,
    );

    if (editor == null) {
        return;
    }

    const { query } = parseDocument(editor.document);

    if (query === lastQuery) {
        return;
    }

    const workspaces = await performSearch(query);
    const currentQuery = parseDocument(editor.document).query;

    // If the query has changed since we started the search, we shouldn't update the results, as they would be out of date
    if (currentQuery !== query) {
        return;
    }

    await refreshSearchResultsDocument(editor, query, workspaces);
}
