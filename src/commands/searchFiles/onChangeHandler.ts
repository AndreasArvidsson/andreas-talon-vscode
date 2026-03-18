import { type TextDocument, window } from "vscode";
import { Debouncer } from "../../util/debounce";
import { parseDocument } from "./parseDocument";
import { lastQuery, performSearch } from "./performSearch";
import { refreshSearchResultsDocument } from "./refreshSearchResultsDocument";

let documentUri: string | null = null;

const debouncer = new Debouncer(() => {
    performUpdate().catch(console.error);
}, 500);

export function onChangeHandler(document: TextDocument) {
    documentUri = document.uri.toString();
    debouncer.run();
}

async function performUpdate() {
    const editor = window.visibleTextEditors.find(
        (editor) => editor.document.uri.toString() === documentUri,
    );

    if (editor == null) {
        return;
    }

    const { document } = editor;

    if (document.uri.toString() !== documentUri) {
        return;
    }

    const { query } = parseDocument(document);

    if (query === lastQuery) {
        return;
    }

    const workspaces = await performSearch(query);
    await refreshSearchResultsDocument(editor, query, workspaces);
}
