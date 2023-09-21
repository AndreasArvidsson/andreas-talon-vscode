import * as path from "node:path";
import * as vscode from "vscode";

export const labelFormatSetting = "workbench.editor.labelFormat";

export function getLabelFormat(tab: vscode.Tab, uri: vscode.Uri): string | undefined {
    const format = vscode.workspace.getConfiguration().get<string>(labelFormatSetting);
    switch (format) {
        case "default":
            return getConflictName(tab, uri);
        case "short":
            return path.basename(path.dirname(uri.fsPath));
        case "medium": {
            const relativeDirPath = path.dirname(vscode.workspace.asRelativePath(uri));
            return relativeDirPath !== "." ? relativeDirPath : undefined;
        }
        case "long":
            return path.dirname(uri.fsPath);
    }
}

function getConflictName(tab: vscode.Tab, uri: vscode.Uri): string | undefined {
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
