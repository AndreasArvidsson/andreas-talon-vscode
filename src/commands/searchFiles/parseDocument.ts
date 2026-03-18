import * as path from "path";
import type { TextDocument } from "vscode";
import { Range, Uri, workspace } from "vscode";
import { getActiveEditor } from "../../util/getActiveEditor";
import { getFullCommand } from "../../util/getFullCommand";
import { deleteLink, divider, languageId, openLink } from "./constants";
import type {
    SearchResultFile,
    SearchResultsState,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export function parseDocument(document: TextDocument): SearchResultsState {
    const result: SearchResultsState = {
        query: "",
        workspaces: [],
        buttons: [],
    };

    if (document.languageId !== languageId) {
        console.warn("Active document is not a search result");
        return result;
    }

    const sectionTexts = document
        .getText()
        .split(new RegExp(`${divider}\\r?\\n`));
    let lineNumber = 0;

    sectionTexts.forEach((sectionText, index) => {
        const lines = sectionText.split(/\r?\n/);

        // The first section contains the query, which is not associated with a specific workspace
        if (index === 0) {
            result.query = sectionText.trim();
            lineNumber += lines.length + 1;
            return;
        }

        // The last section contains the buttons, which are not associated with a specific workspace
        if (index === sectionTexts.length - 1) {
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
                    console.warn(`Unknown search result button: ${lineText}`);
                    return null;
                })();

                if (command == null) {
                    continue;
                }

                const uri = Uri.parse(`command:${getFullCommand(command)}`);
                result.buttons.push({ range, uri });
            }

            return;
        }

        const wsNameIndex = lines.findIndex((line) => line !== "");

        if (wsNameIndex === -1) {
            lineNumber += lines.length + 1;
            console.warn("Workspace name not found in section:", sectionText);
            return;
        }

        const wsName = lines[wsNameIndex];
        lineNumber += wsNameIndex;
        const wsPath = workspace.workspaceFolders?.find(
            (ws) => ws.name === wsName,
        )?.uri.fsPath;

        if (wsPath == null) {
            lineNumber += lines.length + 1;
            console.warn(
                `Workspace folder not found for workspace "${wsName}"`,
            );
            return;
        }

        const ws: SearchResultsWorkspace<SearchResultFile> = {
            name: wsName,
            files: [],
        };
        result.workspaces.push(ws);

        for (let i = wsNameIndex + 1; i < lines.length; i++) {
            const lineText = lines[i];
            const match = lineText.match(/^\s*([-*]\s*)?/);
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

            ws.files.push({ path: relativePath, range, uri, selected });
        }
    });

    return result;
}

export function getSelectedLinks(): SearchResultFile[] {
    const { document } = getActiveEditor();
    return parseDocument(document)
        .workspaces.flatMap((ws) => ws.files)
        .filter((link) => link.selected);
}
