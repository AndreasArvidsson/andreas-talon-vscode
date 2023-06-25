import { Position, TextDocument } from "vscode";
import { ANY, NS } from "./RegexUtils";

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
    const names = getNameAtPosition(document, position);
    if (!names) {
        return undefined;
    }

    const [name, shortName] = names;
    const lineText = document.lineAt(position).text;
    const actionRegex = new RegExp(`${name}\\(${ANY}\\)`, "g");
    const captureRegex = new RegExp(`<${NS}${shortName}>`, "g");
    const listRegex = new RegExp(`{${NS}${name}}`, "g");

    if (testWordAtPosition(position, lineText, actionRegex)) {
        return {
            type: "action",
            name: name
        };
    }

    if (testWordAtPosition(position, lineText, captureRegex)) {
        return {
            type: "capture",
            name: shortName
        };
    }

    if (testWordAtPosition(position, lineText, listRegex)) {
        return {
            type: "list",
            name: name
        };
    }

    return undefined;
}

export function getPythonMatchAtPosition(
    document: TextDocument,
    position: Position
): TalonMatch | undefined {
    const names = getNameAtPosition(document, position);
    if (!names) {
        return undefined;
    }

    const [name, shortName] = names;
    const lineText = document.lineAt(position).text;
    const actionRegex = new RegExp(`actions.${name}\\(`, "g");

    if (testWordAtPosition(position, lineText, actionRegex)) {
        return {
            type: "action",
            name: shortName
        };
    }

    return undefined;
}

function getNameAtPosition(
    document: TextDocument,
    position: Position
): [string, string] | undefined {
    const range = document.getWordRangeAtPosition(position, /\w+(\.\w+)*/);
    if (!range || range.isEmpty || !range.isSingleLine) {
        return undefined;
    }
    const name = document.getText(range).replace(/^actions\./, "");
    const index = name.lastIndexOf(".");
    return [name, index < 0 ? name : name.substring(index + 1)];
}

function testWordAtPosition(position: Position, lineText: string, regex: RegExp): boolean {
    return Array.from(lineText.matchAll(regex)).some(
        (match) =>
            match.index != null &&
            position.character >= match.index &&
            position.character <= match.index + match[0].length
    );
}
