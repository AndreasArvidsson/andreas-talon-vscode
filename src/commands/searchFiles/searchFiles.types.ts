import type { Range, Uri } from "vscode";

export interface PartialSearchResultFile {
    path: string;
    selected: boolean;
}

export interface SearchResultFile extends PartialSearchResultFile {
    range: Range;
    uri: Uri;
}

export interface SearchResultsWorkspace<
    T extends SearchResultFile | PartialSearchResultFile,
> {
    name: string;
    files: T[];
}
