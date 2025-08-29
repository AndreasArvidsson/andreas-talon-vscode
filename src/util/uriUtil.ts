import * as fs from "node:fs";
import * as vscode from "vscode";

export async function recursivelyGetFileUris(uris: vscode.Uri[]) {
    const result: vscode.Uri[] = [];

    for (const uri of uris) {
        if (!fs.existsSync(uri.fsPath)) {
            continue;
        }
        if (fs.lstatSync(uri.fsPath).isDirectory()) {
            const children = await vscode.workspace.findFiles(
                new vscode.RelativePattern(uri, "**/*"),
            );
            result.push(...children);
        } else {
            result.push(uri);
        }
    }

    return sortUris(result);
}

export async function getWorkspaceFiles() {
    // Respects vscode exclusion settings. ie node_modules, .git are excluded.
    const uris = await vscode.workspace.findFiles("**/*");
    return sortUris(uris);
}

function sortUris(uris: vscode.Uri[]) {
    return uris.sort((a, b) => a.fsPath.localeCompare(b.fsPath));
}
