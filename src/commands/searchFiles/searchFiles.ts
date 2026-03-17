import { GLOB_IGNORE_PATTERNS } from "@cursorless/talon-tools";
import fastGlob from "fast-glob";
import {
    Disposable,
    languages,
    Uri,
    window,
    workspace,
    DocumentLink,
    type TextDocument,
} from "vscode";
import { deleteFile } from "../../util/fileSystem";
import { getActiveEditor } from "../../util/getActiveEditor";
import { scheme } from "./constants";
import { getQuery } from "./getQuery";
import { parseDocument } from "./parseDocument";
import type { SearchResultsState } from "./searchFiles.types";
import { SearchResultsProvider } from "./SearchResultsProvider";

const searchResultsStates = new Map<string, SearchResultsState>();
const searchResultsProvider = new SearchResultsProvider(searchResultsStates);

export async function searchFiles(query?: string) {
    if (!query) {
        query = await getQuery();
        if (!query) {
            return;
        }
    }

    const workspaces = await Promise.all(
        (workspace.workspaceFolders ?? []).map(async (ws) => {
            const files = await fastGlob(`**/*${query}*`, {
                cwd: ws.uri.fsPath,
                dot: true,
                caseSensitiveMatch: false,
                ignore: GLOB_IGNORE_PATTERNS,
            });

            return {
                name: ws.name,
                path: ws.uri.fsPath,
                files: files.sort().map((file) => file.replaceAll("\\", "/")),
            };
        }),
    );

    const uri = Uri.from({
        scheme,
        path: getSearchResultsName(query),
        fragment: Date.now().toString(),
    });

    searchResultsStates.set(uri.toString(), {
        workspaces,
        selectedPaths: new Set<string>(),
    });

    await window.showTextDocument(uri, { preview: false });
}

export function searchFilesToggleSelected() {
    const editor = getActiveEditor();
    const { document } = editor;
    const uri = document.uri;
    const state = searchResultsStates.get(uri.toString());

    if (state == null) {
        return;
    }

    const links = parseDocument(document, searchResultsStates).filter((link) =>
        editor.selections.some((sel) => sel.intersection(link.range) != null),
    );

    if (links.length === 0) {
        return;
    }

    for (const link of links) {
        const fileUriString = link.uri.toString();

        if (state.selectedPaths.has(fileUriString)) {
            state.selectedPaths.delete(fileUriString);
        } else {
            state.selectedPaths.add(fileUriString);
        }
    }

    searchResultsProvider.refresh(uri);
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

export function registerSearchResults(): Disposable {
    return Disposable.from(
        workspace.registerTextDocumentContentProvider(
            scheme,
            searchResultsProvider,
        ),
        languages.registerDocumentLinkProvider(
            { scheme },
            {
                provideDocumentLinks(document: TextDocument): DocumentLink[] {
                    return parseDocument(document, searchResultsStates).map(
                        (link) => new DocumentLink(link.range, link.uri),
                    );
                },
            },
        ),
    );
}

function getSearchResultsName(query: string): string {
    const normalizedQuery = query.replaceAll(/[\\/:*?"<>|]/g, " ").trim();
    return normalizedQuery === ""
        ? "Search Results"
        : `Search Results: ${normalizedQuery}`;
}

function getSelectedLinks() {
    const { document } = getActiveEditor();
    return parseDocument(document, searchResultsStates).filter(
        (link) => link.selected,
    );
}
