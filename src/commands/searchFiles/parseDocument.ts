import * as path from "path";
import type { TextDocument } from "vscode";
import { Range, Uri, workspace } from "vscode";
import { getActiveEditor } from "../../util/getActiveEditor";
import { getFullCommand } from "../../util/getFullCommand";
import { deleteLink, divider, languageId, openLink } from "./constants";
import type {
    SearchResultFile,
    SearchResultsWorkspace,
} from "./searchFiles.types";

export function parseDocument(
    document: TextDocument,
): SearchResultsWorkspace<SearchResultFile>[] {
    if (document.languageId !== languageId) {
        console.error("Active document is not a search result");
        return [];
    }

    const workspaces: SearchResultsWorkspace<SearchResultFile>[] = [];
    const wsTexts = document.getText().split(new RegExp(`${divider}\\r?\\n`));
    let lineNumber = 0;

    wsTexts.forEach((wsText, index) => {
        const lines = wsText.split(/\r?\n/);
        const wsName = lines[0];
        const wsPath = workspace.workspaceFolders?.find(
            (ws) => ws.name === wsName,
        )?.uri.fsPath;
        const ws: SearchResultsWorkspace<SearchResultFile> = {
            name: wsName,
            files: [],
        };
        workspaces.push(ws);

        if (index === wsTexts.length - 1) {
            ws.name = "";

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

                ws.files.push({ path: lineText, range, uri, selected: false });
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

            ws.files.push({ path: relativePath, range, uri, selected });
        }
    });

    return workspaces;
}

export function getSelectedLinks(): SearchResultFile[] {
    const { document } = getActiveEditor();
    return parseDocument(document)
        .flatMap((ws) => ws.files)
        .filter((link) => link.selected);
}
