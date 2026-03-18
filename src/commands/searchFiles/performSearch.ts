import { GLOB_IGNORE_PATTERNS } from "@cursorless/talon-tools";
import fastGlob from "fast-glob";
import { workspace } from "vscode";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export let lastQuery = "";

export async function performSearch(
    query: string,
): Promise<SearchResultsWorkspace<PartialSearchResultFile>[]> {
    lastQuery = query;

    // Require at least 3 characters to prevent excessive searching on short queries
    if (query.length < 3) {
        return [];
    }

    return Promise.all(
        (workspace.workspaceFolders ?? []).map(async (ws) => {
            const files = await fastGlob(`**/*${query}*`, {
                cwd: ws.uri.fsPath,
                dot: true,
                caseSensitiveMatch: false,
                ignore: GLOB_IGNORE_PATTERNS,
            });

            return {
                name: ws.name,
                files: files.sort().map((file) => {
                    const path = file.replaceAll("\\", "/");
                    return {
                        path,
                        selected: false,
                    };
                }),
            };
        }),
    );
}
