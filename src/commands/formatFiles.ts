import * as vscode from "vscode";
import fs from "node:fs";

export async function formatWorkspaceFiles() {
    const uris = await vscode.workspace.findFiles("**/*");
    await formatDocuments(uris);
}

export async function formatSelectedFiles(clickedFile: vscode.Uri, selectedFiles: vscode.Uri[]) {
    const uris = await recursivelyGetFileUris(selectedFiles);
    await formatDocuments(uris);
}

async function recursivelyGetFileUris(uris: vscode.Uri[]) {
    const result: vscode.Uri[] = [];

    for (const uri of uris) {
        if (!fs.existsSync(uri.fsPath)) {
            continue;
        }
        if (fs.lstatSync(uri.fsPath).isDirectory()) {
            const children = await vscode.workspace.findFiles(
                new vscode.RelativePattern(uri, "**/*")
            );
            result.push(...children);
        } else {
            result.push(uri);
        }
    }

    return result;
}

async function formatDocuments(uris: vscode.Uri[]) {
    const increment = 100 / uris.length;

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Formatting files",
            cancellable: true
        },
        async (progress, cancellationToken) => {
            for (let i = 0; i < uris.length; ++i) {
                const uri = uris[i];

                if (cancellationToken.isCancellationRequested) {
                    break;
                }

                progress.report({ message: `${i + 1} / ${uris.length}` });

                await formatDocument(uri);

                progress.report({ increment });
            }
        }
    );
}

async function formatDocument(uri: vscode.Uri) {
    try {
        const editor = await vscode.window.showTextDocument(uri, {
            preserveFocus: false,
            preview: true
        });

        await vscode.commands.executeCommand("editor.action.formatDocument", uri);

        if (editor.document.isDirty) {
            await vscode.commands.executeCommand("workbench.action.files.save", uri);
        }

        await vscode.commands.executeCommand("workbench.action.closeActiveEditor", uri);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        // This message will be thrown for binary files
        if (!message.endsWith("Detail: File seems to be binary and cannot be opened as text")) {
            void vscode.window.showWarningMessage(
                `Could not format file: ${uri.fsPath}. ${message}`
            );
        }
    }
}
