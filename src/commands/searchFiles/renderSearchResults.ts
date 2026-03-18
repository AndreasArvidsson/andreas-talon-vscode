import { deleteLink, divider, openLink } from "./constants";
import type {
    PartialSearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export function renderSearchResults(
    query: string,
    workspaces: SearchResultsWorkspace<PartialSearchResultFile>[],
): string {
    const lines: string[] = [query];

    for (const ws of workspaces) {
        if (lines.length > 0) {
            lines.push(divider, "");
        }
        lines.push(ws.name, "");

        for (const file of ws.files) {
            const prefix = file.selected ? "* " : "  ";
            lines.push(`${prefix}${file.path}`);
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
