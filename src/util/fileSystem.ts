import * as fs from "node:fs";
import path from "node:path";
import { Uri, WorkspaceEdit, window, workspace } from "vscode";

export async function createFile(uri: Uri): Promise<void> {
    assertWritableFile(uri);

    const edit = new WorkspaceEdit();
    edit.createFile(uri);
    const result = await workspace.applyEdit(edit);

    if (!result) {
        throw new Error(`Failed to create file: ${uri.fsPath}`);
    }
}

export async function copyFile(source: Uri, destination: Uri): Promise<void> {
    assertWritableFile(destination);

    try {
        await workspace.fs.copy(source, destination);
    } catch (ex) {
        const error = ex as Error;
        throw new Error(`Failed to copy file: ${source.fsPath}. ${error.message}`);
    }
}

export async function renameFile(uri: Uri, filename: string): Promise<void> {
    const dir = path.dirname(uri.fsPath);
    const destination = Uri.file(path.join(dir, filename));

    await moveFile(uri, destination);
}

export async function moveFile(source: Uri, destination: Uri): Promise<void> {
    assertWritableFile(destination);

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

function assertWritableFile(uri: Uri) {
    if (fs.existsSync(uri.fsPath)) {
        const filename = path.basename(uri.fsPath);
        throw Error(`File '${filename}' already exists`);
    }
}
