import type { Options } from "@cursorless/talon-tools";
import { getOptionsFromConfig } from "@cursorless/talon-tools";
import type { TextDocument } from "vscode";
import { workspace } from "vscode";
import { isTesting } from "./isTesting";

interface EditorOptions {
    tabSize?: number | string;
    insertSpaces?: boolean | string;
}

export async function getFormattingOptions(
    document: TextDocument,
    editorOptions: EditorOptions,
): Promise<Options> {
    if (isTesting) {
        return {
            maxLineLength: 10,
            indentSize: 4,
        };
    }

    const fsPath =
        document.uri.scheme === "file"
            ? document.uri.fsPath
            : workspace.workspaceFolders?.[0].uri.fsPath;

    if (fsPath == null) {
        return {};
    }

    const options = await getOptionsFromConfig(fsPath);

    if (
        options.indentSize == null &&
        typeof editorOptions.tabSize === "number"
    ) {
        options.indentSize = editorOptions.tabSize;
    }

    if (
        options.indentTabs == null &&
        typeof editorOptions.insertSpaces === "boolean"
    ) {
        options.indentTabs = !editorOptions.insertSpaces;
    }

    return options;
}
