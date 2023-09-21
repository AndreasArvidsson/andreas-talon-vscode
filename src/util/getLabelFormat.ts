import * as path from "node:path";
import * as vscode from "vscode";

export const labelFormatSetting = "workbench.editor.labelFormat";

export function getLabelFormat(tab: vscode.Tab, uri: vscode.Uri): string | undefined {
    const format = vscode.workspace.getConfiguration().get<string>(labelFormatSetting);
    switch (format) {
        case "default":
            return getConflictPath(tab, uri);
        case "short":
            return getFolderName(uri);
        case "medium":
            return getPathRelativeWorkspace(uri);
        case "long":
            return getAbsolutePath(uri);
    }
}

function getFolderName(uri: vscode.Uri): string {
    return path.basename(path.dirname(uri.fsPath));
}

function getAbsolutePath(uri: vscode.Uri): string {
    return path.dirname(uri.fsPath);
}

function getPathRelativeWorkspace(uri: vscode.Uri): string | undefined {
    const wsFolder = vscode.workspace.getWorkspaceFolder(uri);
    if (wsFolder == null) {
        return getAbsolutePath(uri);
    }
    const relativeDirPath = path.dirname(path.relative(wsFolder.uri.fsPath, uri.fsPath));
    return relativeDirPath !== "." ? relativeDirPath : undefined;
}

function getConflictPath(tab: vscode.Tab, uri: vscode.Uri): string | undefined {
    const hasNameConflict = tab.group.tabs.some((t) => t.label === tab.label && t !== tab);

    if (!hasNameConflict) {
        return undefined;
    }

    const wsFolder = vscode.workspace.getWorkspaceFolder(uri);
    const fsPath = wsFolder != null ? path.relative(wsFolder.uri.fsPath, uri.fsPath) : uri.fsPath;
    const parsedPath = path.parse(fsPath);
    const parts = [parsedPath.root];

    if (parsedPath.dir) {
        const grandFolder = path.dirname(parsedPath.dir);
        const folderName = path.basename(parsedPath.dir);
        // Have additional folders above this one that is not root.
        if (grandFolder && grandFolder !== parsedPath.root && grandFolder !== ".") {
            parts.push("...", path.sep);
        }
        parts.push(folderName);
    }
    // Empty relative path. ie workspace folder
    else {
        parts.push(".", path.sep);
    }

    return parts.join("");
}
