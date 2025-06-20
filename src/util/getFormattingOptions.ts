import * as prettier from "prettier";
import { type TextDocument, workspace } from "vscode";
import { isTesting } from "./isTesting";

interface Options {
    tabSize?: number | string;
    insertSpaces?: boolean | string;
}

export async function getFormattingOptions(document: TextDocument, options: Options) {
    if (isTesting) {
        return {
            lineWidth: 10,
            indentation: "    ",
        };
    }

    const defaultFormatter = workspace.getConfiguration("editor", document).get("defaultFormatter");
    let insertSpaces = typeof options.insertSpaces === "boolean" ? options.insertSpaces : true;
    let tabSize = typeof options.tabSize === "number" ? options.tabSize : 4;
    let lineWidth = 80;

    switch (defaultFormatter) {
        case "redhat.java":
        case "ms-python.black-formatter":
        case "black":
            lineWidth = 88;
            break;
        case "esbenp.prettier-vscode": {
            const prettierConfig = await prettier.resolveConfig(document.uri.fsPath, {
                editorconfig: true,
            });
            lineWidth = prettierConfig?.printWidth ?? 80;
            insertSpaces = !prettierConfig?.useTabs;
            tabSize = prettierConfig?.tabWidth ?? 2;
        }
    }

    const indentation = insertSpaces ? new Array(tabSize).fill(" ").join("") : "\t";

    return { indentation, lineWidth };
}
