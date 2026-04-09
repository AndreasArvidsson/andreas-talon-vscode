import fastGlob from "fast-glob";
import { workspace } from "vscode";
import type { WorkspaceFolder } from "vscode";
import { getGlobIgnorePatterns } from "../../util/getGlobIgnorePatterns";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export function performSearch(
    query: string,
): Promise<SearchResultsWorkspace<PartialSearchResultFile>[]> {
    if (query.length === 0 || workspace.workspaceFolders == null) {
        return Promise.resolve([]);
    }

    return Promise.all(
        workspace.workspaceFolders.map((ws) =>
            performWorkspaceSearch(ws, query),
        ),
    );
}

export async function performWorkspaceSearch(
    ws: WorkspaceFolder,
    query: string,
): Promise<SearchResultsWorkspace<PartialSearchResultFile>> {
    const formattedQuery = query.replaceAll(/\s+/g, "*");
    const glob = `**/*${formattedQuery}*`;

    const files = await fastGlob(glob, {
        cwd: ws.uri.fsPath,
        dot: true,
        caseSensitiveMatch: false,
        ignore: getGlobIgnorePatterns(ws),
    });

    return {
        name: ws.name,
        files: files.toSorted().map((file) => {
            const path = file.replaceAll("\\", "/");
            return {
                path,
                selected: false,
            };
        }),
    };
}
