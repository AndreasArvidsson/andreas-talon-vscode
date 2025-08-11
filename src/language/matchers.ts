import type { Position, TextDocument, TextLine } from "vscode";

export type TalonMatchType = "action" | "capture" | "list" | "dynamic_list";

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
    position: Position,
): TalonMatchName | undefined {
    return getMatchAtPosition(document, position, true);
}

export function getPythonMatchAtPosition(
    document: TextDocument,
    position: Position,
): TalonMatchName | undefined {
    return getMatchAtPosition(document, position, false);
}

export function getTalonPrefixAtPosition(
    document: TextDocument,
    position: Position,
): TalonMatchPrefix | undefined {
    return getPrefixAtPosition(document, position, true);
}

export function getPythonPrefixAtPosition(
    document: TextDocument,
    position: Position,
): TalonMatchPrefix | undefined {
    return getPrefixAtPosition(document, position, false);
}

function getMatchAtPosition(
    document: TextDocument,
    position: Position,
    inTalon: boolean,
): TalonMatchName | undefined {
    const name = getNameAtPosition(document, position);
    if (!name) {
        return undefined;
    }

    const line = document.lineAt(position);
    const lineText = line.text;

    if (inTalon) {
        if (isInTalonScript(line, position)) {
            const actionRegex = new RegExp(`${name}\\([\\s\\S]*?\\)`, "g");
            if (testRegexAtPosition(position, lineText, actionRegex)) {
                return {
                    type: "action",
                    name,
                };
            }
            return undefined;
        }
    } else {
        const actionRegex = new RegExp(`actions.${name}\\(`, "g");
        if (testRegexAtPosition(position, lineText, actionRegex)) {
            return {
                type: "action",
                name,
            };
        }
    }

    const captureRegex = new RegExp(`<${name}>`, "g");
    if (testRegexAtPosition(position, lineText, captureRegex)) {
        return {
            type: "capture",
            name: name,
        };
    }

    const listRegex = new RegExp(`{${name}}`, "g");
    if (testRegexAtPosition(position, lineText, listRegex)) {
        return {
            type: "list",
            name,
        };
    }

    return undefined;
}

function getPrefixAtPosition(
    document: TextDocument,
    position: Position,
    inTalon: boolean,
): TalonMatchPrefix | undefined {
    const line = document.lineAt(position.line);
    const precedingText = line.text.substring(0, position.character);
    const prefix = precedingText.match(/[\w\d.]+$/)?.[0] ?? "";

    if (inTalon) {
        if (isInTalonScript(line, position)) {
            return { type: "action", prefix };
        }
    } else {
        if (prefix.startsWith("actions.")) {
            return { type: "action", prefix: prefix.substring(8) };
        }
    }

    const prevChar = precedingText.at(-prefix.length - 1) ?? "";

    if (prevChar === "{") {
        return { type: "list", prefix };
    }

    if (prevChar === "<") {
        return { type: "capture", prefix };
    }

    return undefined;
}

/** Returns true if the line is indented or the position is to the right side of the `:` */
function isInTalonScript(line: TextLine, position: Position) {
    if (line.firstNonWhitespaceCharacterIndex > 0) {
        return true;
    }
    const index = line.text.indexOf(":");
    return index > -1 && index < position.character;
}

function getNameAtPosition(
    document: TextDocument,
    position: Position,
): string | undefined {
    const range = document.getWordRangeAtPosition(position, /[\w\d.]+/);
    if (!range || range.isEmpty || !range.isSingleLine) {
        return undefined;
    }
    return document.getText(range).replace(/^actions\./, "");
}

function testRegexAtPosition(
    position: Position,
    lineText: string,
    regex: RegExp,
): boolean {
    return Array.from(lineText.matchAll(regex)).some(
        (match) =>
            match.index != null &&
            position.character >= match.index &&
            position.character <= match.index + match[0].length,
    );
}
