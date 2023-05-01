import { Position, TextDocument } from "vscode";
import { ANY, NS } from "./RegexUtils";

export interface TalonMatch {
    text: string;
    type: "action" | "capture" | "list";
}

export function getTalonMatchAtPosition(
    document: TextDocument,
    position: Position
): TalonMatch | undefined {
    const wordText = getWordAtPosition(document, position);
    if (!wordText) {
        return undefined;
    }

    const lineText = document.lineAt(position).text;
    const actionRegex = new RegExp(`${NS}${wordText}\\(${ANY}\\)`, "g");
    const captureRegex = new RegExp(`<${NS}${wordText}>`, "g");
    const listRegex = new RegExp(`{${NS}${wordText}}`, "g");

    if (testWordAtPosition(position, lineText, actionRegex)) {
        return {
            text: wordText,
            type: "action"
        };
    }

    if (testWordAtPosition(position, lineText, captureRegex)) {
        return {
            text: wordText,
            type: "capture"
        };
    }

    if (testWordAtPosition(position, lineText, listRegex)) {
        return {
            text: wordText,
            type: "list"
        };
    }

    return undefined;
}

export function getPythonMatchAtPosition(
    document: TextDocument,
    position: Position
): TalonMatch | undefined {
    const wordText = getWordAtPosition(document, position);
    if (!wordText) {
        return undefined;
    }

    const lineText = document.lineAt(position).text;
    const actionRegex = new RegExp(`actions\\.${NS}${wordText}\\(`, "g");

    if (testWordAtPosition(position, lineText, actionRegex)) {
        return {
            text: wordText,
            type: "action"
        };
    }

    return undefined;
}

function getWordAtPosition(document: TextDocument, position: Position): string | undefined {
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange || wordRange.isEmpty || !wordRange.isSingleLine) {
        return undefined;
    }
    return document.getText(wordRange);
}

function testWordAtPosition(position: Position, lineText: string, regex: RegExp): boolean {
    return Array.from(lineText.matchAll(regex)).some(
        (match) =>
            match.index != null &&
            position.character >= match.index &&
            position.character <= match.index + match[0].length
    );
}
