import fastGlob from "fast-glob";
import { type WorkspaceFolder, workspace } from "vscode";
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
    const queryPattern = query.replaceAll(/\s+/g, "*");

    const files = await fastGlob(`**/*${queryPattern}*`, {
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
