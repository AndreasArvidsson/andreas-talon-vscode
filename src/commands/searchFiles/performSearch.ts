import { GLOB_IGNORE_PATTERNS } from "@cursorless/talon-tools";
import fastGlob from "fast-glob";
import { workspace, type WorkspaceFolder } from "vscode";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export async function performSearch(
    query: string,
): Promise<SearchResultsWorkspace<PartialSearchResultFile>[]> {
    if (query.length === 0 || workspace.workspaceFolders == null) {
        return [];
    }

    return Promise.all(
        workspace.workspaceFolders.map((ws) =>
            performWorkspaceSearch(ws, query),
        ),
    );
}

export async function performWorkspaceSearch(
    workspace: WorkspaceFolder,
    query: string,
): Promise<SearchResultsWorkspace<PartialSearchResultFile>> {
    const files = await fastGlob(`**/*${query}**`, {
        cwd: workspace.uri.fsPath,
        dot: true,
        caseSensitiveMatch: false,
        ignore: GLOB_IGNORE_PATTERNS,
    });

    return {
        name: workspace.name,
        files: files.sort().map((file) => {
            const path = file.replaceAll("\\", "/");
            return {
                path,
                selected: false,
            };
        }),
    };
}
