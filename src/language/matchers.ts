import { Position, TextDocument } from "vscode";
import { ANY } from "./RegexUtils";

export type TalonMatchType = "action" | "capture" | "list";

export interface TalonMatchName {
    type: TalonMatchType;
    name: string;
}

export interface TalonMatchPrefix {
    type: TalonMatchType;
    prefix: string;
}

export type TalonMatch = TalonMatchName | TalonMatchPrefix;

export function getTalonMatchAtPosition(
    document: TextDocument,
    position: Position
): TalonMatchName | undefined {
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
): TalonMatchName | undefined {
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

export function getTalonPrefixAtPosition(
    document: TextDocument,
    position: Position
): TalonMatchPrefix | undefined {
    const line = document.lineAt(position.line);
    const text = line.text.substring(0, position.character);
    const prefix = text.match(/[\w\d.]+$/)?.[0] ?? "";
    const isInScript = line.firstNonWhitespaceCharacterIndex !== 0 || text.includes(":");

    // When in the script side of the command available values are the action names
    if (isInScript) {
        return { type: "action", prefix };
    }

    const prevChar =
        text
            .substring(0, text.length - prefix.length)
            .trim()
            .at(-1) ?? "";

    // When in the rule side of the command available values are list and capture names
    if (prevChar === "{") {
        return { type: "list", prefix };
    }

    if (prevChar === "<") {
        return { type: "capture", prefix };
    }

    return undefined;
}

export function getPythonPrefixAtPosition(
    document: TextDocument,
    position: Position
): TalonMatchPrefix | undefined {
    const line = document.lineAt(position.line);
    const text = line.text.substring(0, position.character);
    const prefix = text.trimStart().match(/actions.[\w\d.]*$/)?.[0];
    if (!prefix) {
        return undefined;
    }
    return { type: "action", prefix: prefix.substring(8) };
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
