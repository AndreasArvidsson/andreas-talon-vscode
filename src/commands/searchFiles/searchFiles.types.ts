import type { Range, Uri } from "vscode";

export interface Link {
    range: Range;
    uri: Uri;
    selected: boolean;
}

export interface SearchResultsWorkspace {
    name: string;
    path: string;
    files: string[];
}

export interface SearchResultsState {
    workspaces: SearchResultsWorkspace[];
    selectedPaths: Set<string>;
}
