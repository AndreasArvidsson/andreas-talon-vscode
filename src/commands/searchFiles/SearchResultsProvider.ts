import * as path from "node:path";
import { Uri } from "vscode";
import type { TextDocumentContentProvider } from "vscode";
import { EventEmitter } from "vscode";
import { deleteLink, divider, openLink } from "./constants";
import type { SearchResultsState } from "./searchFiles.types";

export class SearchResultsProvider implements TextDocumentContentProvider {
    private emitter = new EventEmitter<Uri>();

    readonly onDidChange = this.emitter.event;

    constructor(private searchResultsStates: Map<string, SearchResultsState>) {}

    provideTextDocumentContent(uri: Uri): string {
        const state = this.searchResultsStates.get(uri.toString());
        return state == null ? "" : renderSearchResults(state);
    }

    refresh(uri: Uri) {
        this.emitter.fire(uri);
    }
}

function renderSearchResults(state: SearchResultsState): string {
    const lines: string[] = [];

    for (const ws of state.workspaces) {
        if (lines.length > 0) {
            lines.push(divider, "");
        }
        lines.push(ws.name, "");

        for (const file of ws.files) {
            const absPath = path.resolve(ws.path, file);
            const fileUriString = Uri.file(absPath).toString();
            const prefix = state.selectedPaths.has(fileUriString) ? "* " : "  ";
            lines.push(`${prefix}${file}`);
        }

        lines.push("");
    }

    lines.push(
        divider,
        "",
        openLink,
        "",
        deleteLink,
        "",
        "Select a file by adding a '*' or '-' prefix",
        "",
    );

    return lines.join("\n");
}
