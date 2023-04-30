import fs from "node:fs";
import path from "node:path";
import { Uri, WorkspaceEdit, window, workspace } from "vscode";

export async function createFile(uri: Uri): Promise<void> {
    assertNonExistingFile(uri);

    const edit = new WorkspaceEdit();
    edit.createFile(uri);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to create file: ${uri.fsPath}`);
    }
}

export async function copyFile(source: Uri, destination: Uri): Promise<void> {
    assertNonExistingFile(destination);

    try {
        await workspace.fs.copy(source, destination);
    } catch (ex) {
        const error = ex as Error;
        throw new Error(`Failed to copy file: ${source.fsPath}. ${error.message}`);
    }
}

export async function renameFile(uri: Uri, filename: string): Promise<void> {
    const dir = getDir(uri);
    const originalFilename = getFilename(uri);
    const destination = Uri.file(path.join(dir, filename));

    // Special case for when just change case case of a filename
    if (originalFilename.toLocaleLowerCase() === filename.toLocaleLowerCase()) {
        fs.renameSync(uri.fsPath, destination.fsPath);
        return;
    }

    assertNonExistingFile(destination);
    const edit = new WorkspaceEdit();
    edit.renameFile(uri, destination);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to rename file: ${uri.fsPath}`);
    }
}

export async function moveFile(source: Uri, destination: Uri): Promise<void> {
    assertNonExistingFile(destination);

    const edit = new WorkspaceEdit();
    edit.renameFile(source, destination);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to move file: ${source.fsPath}`);
    }
}

export async function deleteFile(uri: Uri): Promise<void> {
    const edit = new WorkspaceEdit();
    edit.deleteFile(uri);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to remove file: ${uri.fsPath}`);
    }
}

export async function openTextDocument(uri: Uri): Promise<void> {
    const document = await workspace.openTextDocument(uri);
    await window.showTextDocument(document);
}

export function getFilename(uri: Uri): string {
    return path.basename(fs.realpathSync.native(uri.fsPath));
}

export function getDir(uri: Uri): string {
    return path.dirname(uri.fsPath);
}

function assertNonExistingFile(uri: Uri) {
    if (fileExists(uri)) {
        const filename = getFilename(uri);
        throw Error(`File '${filename}' already exists`);
    }
}

function fileExists(uri: Uri) {
    return fs.existsSync(uri.fsPath);
}
