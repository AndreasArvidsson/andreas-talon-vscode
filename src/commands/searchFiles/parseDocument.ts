import * as path from "path";
import type { TextDocument } from "vscode";
import { Range, Uri } from "vscode";
import { getFullCommand } from "../../util/getFullCommand";
import { deleteLink, divider, openLink, scheme } from "./constants";
import type { Link, SearchResultsState } from "./searchFiles.types";

export function parseDocument(
    document: TextDocument,
    searchResultsStates: Map<string, SearchResultsState>,
): Link[] {
    if (document.uri.scheme !== scheme) {
        console.error("Active document is not a search result");
        return [];
    }

    const links: Link[] = [];
    const wsTexts = document.getText().split(divider + "\n");
    const searchResultsState = searchResultsStates.get(document.uri.toString());
    let lineNumber = 0;
    let hasSelectedLink = false;

    wsTexts.forEach((wsText, index) => {
        const lines = wsText.split("\n");
        const wsName = lines[0];
        const wsPath = searchResultsState?.workspaces.find(
            (ws) => ws.name === wsName,
        )?.path;

        if (index === wsTexts.length - 1) {
            if (!hasSelectedLink) {
                return;
            }

            for (const lineText of lines) {
                const range = new Range(
                    lineNumber,
                    0,
                    lineNumber,
                    lineText.length,
                );

                lineNumber++;

                if (lineText.trim() === "") {
                    continue;
                }

                const command = (() => {
                    if (lineText === openLink) {
                        return "searchFilesOpenSelected";
                    }
                    if (lineText === deleteLink) {
                        return "searchFilesDeleteSelected";
                    }
                    return null;
                })();

                if (command == null) {
                    continue;
                }

                const uri = Uri.parse(`command:${getFullCommand(command)}`);

                links.push({ range, uri, selected: false });
            }

            return;
        }

        if (wsPath == null || lines.length < 2) {
            lineNumber += lines.length + 1;
            return;
        }

        lineNumber++;

        for (let i = 1; i < lines.length; i++) {
            const lineText = lines[i];
            const match = lineText.match(/^\s*([-*]\s+)?/);
            const offset = match?.[0]?.length ?? 0;
            const selected = match?.[1] != null;
            const relativePath = lineText.slice(offset).trimEnd();

            const range = new Range(
                lineNumber,
                offset,
                lineNumber,
                offset + relativePath.length,
            );

            lineNumber++;

            if (relativePath === "") {
                continue;
            }

            const absPath = path.resolve(wsPath, relativePath);
            const uri = Uri.file(absPath);

            if (selected) {
                hasSelectedLink = true;
            }

            links.push({ range, uri, selected });
        }
    });

    return links;
}
