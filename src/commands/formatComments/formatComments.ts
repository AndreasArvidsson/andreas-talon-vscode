import * as prettier from "prettier";
import * as vscode from "vscode";
import { getActiveEditor } from "../../util/getActiveEditor";
import { isTesting } from "../../util/isTesting";
import { JavascriptFormatter } from "./JavascriptFormatter";
import { PythonFormatter } from "./PythonFormatter";
import type { CommentFormatter } from "./types";

export function formatComments(): Promise<void> {
    const editor = getActiveEditor();
    return formatCommentsForEditor(editor);
}

export async function formatCommentsForEditor(editor: vscode.TextEditor) {
    const { document } = editor;
    const lineWidth = await getLineWidth(document);
    const configuration = getFormatter(document.languageId, lineWidth);

    if (configuration == null) {
        return;
    }

    const changes = configuration.parse(document);

    if (changes.length === 0) {
        return;
    }

    await editor.edit((editBuilder) => {
        changes.forEach((change) => {
            editBuilder.replace(change.range, change.text);
        });
    });
}

function getFormatter(languageId: string, lineWidth: number): CommentFormatter | undefined {
    switch (languageId) {
        case "javascript":
        case "typescript":
        case "javascriptreact":
        case "typescriptreact":
        case "java":
            return new JavascriptFormatter(lineWidth);
        case "python":
            return new PythonFormatter(lineWidth);
        default:
            return undefined;
    }
}

async function getLineWidth(document: vscode.TextDocument): Promise<number> {
    if (isTesting) {
        return 10;
    }

    const prettierConfig = await prettier.resolveConfig(document.uri.fsPath, {
        editorconfig: true
    });

    return prettierConfig?.printWidth ?? 80;
}
