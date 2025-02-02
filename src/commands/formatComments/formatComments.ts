import * as prettier from "prettier";
import * as vscode from "vscode";
import { getActiveEditor } from "../../util/getActiveEditor";
import { isTesting } from "../../util/isTesting";
import { JavascriptConfig } from "./JavascriptConfig";
import type { Configuration } from "./types";

export function formatComments(): Promise<void> {
    const editor = getActiveEditor();
    return formatCommentsEditor(editor);
}

export async function formatCommentsEditor(editor: vscode.TextEditor) {
    const { document } = editor;
    const lineWidth = await getLineWidth(document);
    const configuration = getConfiguration(document.languageId, lineWidth);

    if (configuration == null) {
        return;
    }

    const changes = configuration.parse(document);

    if (changes.length === 0) {
        return;
    }

    await editor.edit((editBuilder) => {
        changes.forEach((change) => {
            editBuilder.replace(change.range, change.newText);
        });
    });
}

function getConfiguration(languageId: string, lineWidth: number): Configuration | undefined {
    switch (languageId) {
        case "javascript":
            return new JavascriptConfig(lineWidth);
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
