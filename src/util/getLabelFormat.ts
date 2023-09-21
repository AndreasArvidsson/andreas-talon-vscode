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

function getFolderName(uri: vscode.Uri) {
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

    const parts = [];
    const relativePath = vscode.workspace.asRelativePath(uri);
    const parsedPath = path.parse(relativePath);
    const parentName = path.basename(parsedPath.dir);

    if (parsedPath.root) {
        parts.push(parsedPath.root);
        const dirParent = path.dirname(parsedPath.dir);
        if (dirParent && dirParent !== parsedPath.root) {
            parts.push("...");
            parts.push(path.sep);
        }
    } else if (!parentName) {
        parts.push(".", path.sep);
    }

    if (parentName) {
        parts.push(parentName);
    }

    return parts.join("");
}
