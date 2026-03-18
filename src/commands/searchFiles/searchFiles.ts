import { GLOB_IGNORE_PATTERNS } from "@cursorless/talon-tools";
import fastGlob from "fast-glob";
import {
    Disposable,
    DocumentLink,
    languages,
    Uri,
    window,
    workspace,
    type TextDocument,
} from "vscode";
import { deleteFile } from "../../util/fileSystem";
import { getActiveEditor } from "../../util/getActiveEditor";
import { languageId } from "./constants";
import { getQuery } from "./getQuery";
import { getSelectedLinks, parseDocument } from "./parseDocument";
import { refreshSearchResultsDocument } from "./refreshSearchResultsDocument";
import type { PartialSearchResultFile } from "./searchFiles.types";

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
                files: files.sort().map((file): PartialSearchResultFile => {
                    const path = file.replaceAll("\\", "/");
                    return {
                        path,
                        selected: false,
                    };
                }),
            };
        }),
    );

    const uri = Uri.file(getSearchResultsName(query)).with({
        scheme: "untitled",
    });
    const document = await workspace.openTextDocument(uri);
    const searchResultsDocument = await languages.setTextDocumentLanguage(
        document,
        languageId,
    );
    const editor = await window.showTextDocument(searchResultsDocument, {
        preview: false,
    });
    await refreshSearchResultsDocument(editor, workspaces);
}

export async function searchFilesToggleSelected() {
    const editor = getActiveEditor();
    const { document, selections } = editor;

    const workspaces = parseDocument(document).filter((ws) => ws.name !== "");

    for (const ws of workspaces) {
        for (const link of ws.files) {
            if (
                selections.some((sel) => sel.intersection(link.range) != null)
            ) {
                link.selected = !link.selected;
            }
        }
    }

    await refreshSearchResultsDocument(editor, workspaces);
}

export function searchFilesOpenSelected() {
    console.log(getSelectedLinks());
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
            {
                provideDocumentLinks(document: TextDocument): DocumentLink[] {
                    return parseDocument(document).flatMap((ws) =>
                        ws.files.map(
                            (link) => new DocumentLink(link.range, link.uri),
                        ),
                    );
                },
            },
        ),
        // workspace.onDidChangeTextDocument((event) => {
        //     if (!searchResultsStates.has(event.document.uri.toString())) {
        //         return;
        //     }

        //     syncSelectedPaths(event.document);
        // }),
        // workspace.onDidCloseTextDocument((document) => {
        //     searchResultsStates.delete(document.uri.toString());
        // }),
    );
}

function getSearchResultsName(query: string): string {
    const normalizedQuery = query.replaceAll(/[\\/:*?"<>|]/g, " ");
    return `Search: ${normalizedQuery}`;
}
