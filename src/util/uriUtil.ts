import * as fs from "node:fs/promises";
import * as vscode from "vscode";
import { getErrorMessage } from "./getErrorMessage";

export async function recursivelyGetFileUris(uris: vscode.Uri[]) {
    const result = await Promise.all(uris.map(getFileUris));
    return sortUris(result.flat());
}

async function getFileUris(uri: vscode.Uri): Promise<vscode.Uri[]> {
    try {
        const stat = await fs.lstat(uri.fsPath);

        if (stat.isDirectory()) {
            return await vscode.workspace.findFiles(
                new vscode.RelativePattern(uri, "**/*"),
            );
        }

        return [uri];
    } catch (e) {
        void vscode.window.showErrorMessage(getErrorMessage(e));
        return [];
    }
}

export async function getWorkspaceFiles(): Promise<vscode.Uri[]> {
    // Respects vscode exclusion settings. ie node_modules, .git are excluded.
    const uris = await vscode.workspace.findFiles("**/*");
    return sortUris(uris);
}

function sortUris(uris: vscode.Uri[]): vscode.Uri[] {
    return uris.toSorted((a, b) => a.fsPath.localeCompare(b.fsPath));
}
