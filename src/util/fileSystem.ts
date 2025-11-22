import * as fs from "node:fs";
import * as path from "node:path";
import * as vscode from "vscode";

export async function createFile(uri: vscode.Uri): Promise<void> {
    assertNonExistingFile(uri);

    const edit = new vscode.WorkspaceEdit();
    edit.createFile(uri);
    const result = await vscode.workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to create file: ${uri.fsPath}`);
    }
}

export async function copyFile(
    source: vscode.Uri,
    destination: vscode.Uri,
): Promise<void> {
    assertNonExistingFile(destination);

    try {
        await vscode.workspace.fs.copy(source, destination);
    } catch (ex) {
        const error = ex as Error;
        throw new Error(
            `Failed to copy file: ${source.fsPath}. ${error.message}`,
        );
    }
}

export async function renameFile(
    uri: vscode.Uri,
    filename: string,
): Promise<void> {
    const dir = getDir(uri);
    const originalFilename = getFilename(uri);
    const destination = vscode.Uri.file(path.join(dir, filename));

    // Special case for when just change case case of a filename
    if (originalFilename.toLocaleLowerCase() === filename.toLocaleLowerCase()) {
        fs.renameSync(uri.fsPath, destination.fsPath);
        return;
    }

    assertNonExistingFile(destination);
    const edit = new vscode.WorkspaceEdit();
    edit.renameFile(uri, destination);
    const result = await vscode.workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to rename file: ${uri.fsPath}`);
    }
}

export async function moveFile(
    source: vscode.Uri,
    destination: vscode.Uri,
): Promise<void> {
    assertNonExistingFile(destination);

    const edit = new vscode.WorkspaceEdit();
    edit.renameFile(source, destination);
    const result = await vscode.workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to move file: ${source.fsPath}`);
    }
}

export async function deleteFile(uri: vscode.Uri): Promise<void> {
    const edit = new vscode.WorkspaceEdit();
    edit.deleteFile(uri);
    const result = await vscode.workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to remove file: ${uri.fsPath}`);
    }
}

export function getFilename(uri: vscode.Uri): string {
    return path.basename(fs.realpathSync.native(uri.fsPath));
}

export function getDir(uri: vscode.Uri): string {
    return path.dirname(uri.fsPath);
}

function assertNonExistingFile(uri: vscode.Uri) {
    if (fileExists(uri)) {
        const filename = getFilename(uri);
        throw Error(`File '${filename}' already exists`);
    }
}

function fileExists(uri: vscode.Uri) {
    return fs.existsSync(uri.fsPath);
}
