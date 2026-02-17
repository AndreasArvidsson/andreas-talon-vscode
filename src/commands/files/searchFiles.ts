import { glob } from "glob";
import * as path from "node:path";
import * as vscode from "vscode";
import { deleteFile } from "../../util/fileSystem";
import { getActiveEditor } from "../../util/getActiveEditor";
import { getFullCommand } from "../../util/getFullCommand";

interface Link {
    range: vscode.Range;
    uri: vscode.Uri;
    selected: boolean;
}

const divider = "----------------------------------------";
const languageId = "search-results";
const openLink = "[Open files]";
const deleteLink = "[Delete files]";

export async function searchFiles(query?: string) {
    const lines: string[] = [];

    if (!query) {
        query = await getQuery();
        if (!query) {
            return;
        }
    }

    for (const ws of vscode.workspace.workspaceFolders ?? []) {
        if (lines.length > 0) {
            lines.push(divider, "");
        }
        lines.push(ws.name, "");

        const files = await glob(`**/*${query}*`, {
            cwd: ws.uri.fsPath,
            dot: true,
            posix: true,
        });

        for (const file of files.sort()) {
            lines.push(`  ${file}`);
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

    const document = await vscode.workspace.openTextDocument({
        content: lines.join("\n"),
        language: languageId,
    });

    await vscode.window.showTextDocument(document);
}

export function searchFilesOpenSelected() {
    return Promise.all(
        getSelectedLinks().map((link) =>
            vscode.window.showTextDocument(link.uri, { preview: false }),
        ),
    );
}

export async function searchFilesDeleteSelected() {
    const selectedLinks = getSelectedLinks();

    const remove =
        selectedLinks.length > 0 &&
        (await vscode.window.showInformationMessage(
            `Are you sure you want to delete ${selectedLinks.length} files?`,
            { modal: true },
            "Delete files",
        ));

    if (remove) {
        await Promise.all(selectedLinks.map((link) => deleteFile(link.uri)));
    }
}

export function registerSearchResults(): vscode.Disposable {
    return vscode.languages.registerDocumentLinkProvider(
        { language: languageId },
        {
            provideDocumentLinks(
                document: vscode.TextDocument,
            ): vscode.DocumentLink[] {
                return parseDocument(document).map(
                    (link) => new vscode.DocumentLink(link.range, link.uri),
                );
            },
        },
    );
}

function getSelectedLinks() {
    return parseDocument(getActiveEditor().document).filter(
        (link) => link.selected,
    );
}

function parseDocument(document: vscode.TextDocument): Link[] {
    if (document.languageId !== languageId) {
        console.error("Active document is not a search result");
        return [];
    }

    const links: Link[] = [];
    const wsTexts = document.getText().split(divider + "\n");
    let lineNumber = 0;
    let hasSelectedLink = false;

    wsTexts.forEach((wsText, index) => {
        const lines = wsText.split("\n");
        const wsName = lines[0];
        const wsPath = vscode.workspace.workspaceFolders?.find(
            (ws) => ws.name === wsName,
        )?.uri.fsPath;

        if (index === wsTexts.length - 1) {
            if (!hasSelectedLink) {
                return;
            }

            for (const lineText of lines) {
                const range = new vscode.Range(
                    lineNumber,
                    0,
                    lineNumber,
                    0 + lineText.length,
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

                const uri = vscode.Uri.parse(
                    `command:${getFullCommand(command)}`,
                );

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

            const range = new vscode.Range(
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
            const uri = vscode.Uri.file(absPath);

            if (selected) {
                hasSelectedLink = true;
            }

            links.push({ range, uri, selected });
        }
    });

    return links;
}

async function getQuery(): Promise<string | undefined> {
    const query = await vscode.window.showInputBox({
        prompt: "Search query",
        placeHolder: "Search query",
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (value.trim()) {
                return null;
            }
            return "Can't be empty";
        },
    });
    return query ? query.trim() : undefined;
}
