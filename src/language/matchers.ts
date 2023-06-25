import { Position, TextDocument } from "vscode";
import { ANY } from "./RegexUtils";

export type TalonMatchType = "action" | "capture" | "list";

interface TalonMatchName {
    type: TalonMatchType;
    name: string;
}

interface TalonMatchPrefix {
    type: TalonMatchType;
    prefix: string;
}

export type TalonMatch = TalonMatchName | TalonMatchPrefix;

export function getTalonMatchAtPosition(
    document: TextDocument,
    position: Position
): TalonMatch | undefined {
    const name = getNameAtPosition(document, position);
    if (!name) {
        return undefined;
    }

    const lineText = document.lineAt(position).text;
    const actionRegex = new RegExp(`${name}\\(${ANY}\\)`, "g");
    const captureRegex = new RegExp(`<${name}>`, "g");
    const listRegex = new RegExp(`{${name}}`, "g");

    if (testWordAtPosition(position, lineText, actionRegex)) {
        return {
            type: "action",
            name
        };
    }

    if (testWordAtPosition(position, lineText, captureRegex)) {
        return {
            type: "capture",
            name: name
        };
    }

    if (testWordAtPosition(position, lineText, listRegex)) {
        return {
            type: "list",
            name
        };
    }

    return undefined;
}

export function getPythonMatchAtPosition(
    document: TextDocument,
    position: Position
): TalonMatch | undefined {
    const name = getNameAtPosition(document, position);
    if (!name) {
        return undefined;
    }

    const lineText = document.lineAt(position).text;
    const actionRegex = new RegExp(`actions.${name}\\(`, "g");

    if (testWordAtPosition(position, lineText, actionRegex)) {
        return {
            type: "action",
            name
        };
    }

    return undefined;
}

function getNameAtPosition(document: TextDocument, position: Position): string | undefined {
    const range = document.getWordRangeAtPosition(position, /\w+(\.\w+)*/);
    if (!range || range.isEmpty || !range.isSingleLine) {
        return undefined;
    }
    return document.getText(range).replace(/^actions\./, "");
}

function testWordAtPosition(position: Position, lineText: string, regex: RegExp): boolean {
    return Array.from(lineText.matchAll(regex)).some(
        (match) =>
            match.index != null &&
            position.character >= match.index &&
            position.character <= match.index + match[0].length
    );
}
