import * as vscode from "vscode";
import { getWorkspaceFiles, recursivelyGetFileUris } from "../util/uriUtil";

export async function formatWorkspaceFiles() {
    if (vscode.env.remoteName !== undefined) {
        throw Error("Format workspace files is only supported for local workspaces.");
    }
    const uris = await getWorkspaceFiles();
    await formatDocuments(uris);
}

export async function formatSelectedFiles(
    clickedFile: vscode.Uri,
    selectedFiles: vscode.Uri[],
) {
    if (vscode.env.remoteName !== undefined) {
        throw Error("Format selected files is only supported for local workspaces.");
    }
    const uris = await recursivelyGetFileUris(selectedFiles);
    await formatDocuments(uris);
}

async function formatDocuments(uris: vscode.Uri[]) {
    const increment = 100 / uris.length;

    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Formatting files",
            cancellable: true,
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
        },
    );
}

async function formatDocument(uri: vscode.Uri) {
    try {
        const editor = await vscode.window.showTextDocument(uri, {
            preserveFocus: false,
            preview: true,
        });

        await vscode.commands.executeCommand("editor.action.formatDocument");

        if (editor.document.isDirty) {
            await vscode.commands.executeCommand(
                "workbench.action.files.saveWithoutFormatting",
            );
        }

        await vscode.commands.executeCommand(
            "workbench.action.closeActiveEditor",
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!isMessageBinary(message)) {
            void vscode.window.showWarningMessage(
                `Could not format file: ${uri.fsPath}. ${message}`,
            );
        }
    }
}

function isMessageBinary(errorMessage: string) {
    // This message will be thrown for binary files
    return errorMessage.endsWith(
        "Detail: File seems to be binary and cannot be opened as text",
    );
}
