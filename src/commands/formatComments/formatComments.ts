import * as prettier from "prettier";
import * as vscode from "vscode";
import { getActiveEditor } from "../../util/getActiveEditor";
import { isTesting } from "../../util/isTesting";
import { JavaFormatter } from "./JavaFormatter";
import { LuaFormatter } from "./LuaFormatter";
import { PythonFormatter } from "./PythonFormatter";
import type { CommentFormatter } from "./types";
import { XmlFormatter } from "./XmlFormatter";

interface Properties {
    editor: vscode.TextEditor;
    doSave?: boolean;
    onlySelected?: boolean;
}

export function formatComments(): Promise<void> {
    return formatCommentsRunner({ editor: getActiveEditor(), onlySelected: true });
}

export function formatAllComments(): Promise<void> {
    return formatCommentsRunner({ editor: getActiveEditor() });
}

export async function formatCommentsRunner(properties: Properties): Promise<void> {
    const { editor, doSave, onlySelected } = properties;
    const { document } = editor;
    const lineWidth = await getLineWidth(document);
    const configuration = getFormatter(document.languageId, lineWidth);
    const selections = onlySelected ? editor.selections : undefined;

    if (configuration == null) {
        return;
    }

    const changes = configuration.parse(document, selections);

    if (changes.length === 0) {
        return;
    }

    await editor.edit((editBuilder) => {
        changes.forEach((change) => {
            editBuilder.replace(change.range, change.text);
        });
    });

    if (doSave && document.isDirty) {
        await vscode.commands.executeCommand("workbench.action.files.save", document.uri);
    }
}

function getFormatter(languageId: string, lineWidth: number): CommentFormatter | undefined {
    switch (languageId) {
        case "java":
        case "javascript":
        case "typescript":
        case "javascriptreact":
        case "typescriptreact":
        case "c":
        case "cpp":
        case "csharp":
        case "css":
        case "json":
        case "jsonc":
        case "jsonl":
            return new JavaFormatter(lineWidth);

        case "python":
        case "talon":
        case "talon-list":
        case "yaml":
            return new PythonFormatter(lineWidth);

        case "xml":
        case "html":
            return new XmlFormatter(lineWidth);

        case "lua":
            return new LuaFormatter(lineWidth);

        default:
            return undefined;
    }
}

async function getLineWidth(document: vscode.TextDocument): Promise<number> {
    if (isTesting) {
        return 10;
    }

    const prettierConfig = await prettier.resolveConfig(document.uri.fsPath, {
        editorconfig: true,
    });

    if (prettierConfig?.printWidth != null) {
        return prettierConfig.printWidth;
    }

    const defaultFormatter = getConfiguration("editor", "defaultFormatter");

    switch (defaultFormatter) {
        case "ms-python.black-formatter":
        case "black":
            return 88;
    }

    return 80;
}

function getConfiguration<T>(section: string, key: string): T | undefined {
    return vscode.workspace.getConfiguration(section).get<T>(key);
}
