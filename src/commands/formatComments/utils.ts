import type { Selection, TextDocument } from "vscode";
import { Range } from "vscode";
import type { Token } from "./types";

export const isValidLineRegex = /\w/;

export function isValidLine(text: string): boolean {
    return isValidLineRegex.test(text);
}

export function parseTokens(
    tokens: Token[],
    lineWidth: number,
    indentation: string,
    linePrefix: string,
): string[] {
    const updatedLines: string[] = [];
    const currentLine: string[] = [];
    let currentLineLength = indentation.length + linePrefix.length;

    for (const { text, preserve } of tokens) {
        if (preserve || currentLineLength + text.length + 1 > lineWidth) {
            if (currentLine.length > 0) {
                updatedLines.push(joinLine(currentLine, indentation, linePrefix));
            }
            currentLine.length = 0;
            currentLineLength = indentation.length + linePrefix.length;
        }

        if (preserve) {
            updatedLines.push(joinLine([text], indentation, linePrefix));
            continue;
        }

        currentLine.push(text);
        // Add 1 for the space between tokens
        currentLineLength += text.length + 1;
    }

    if (currentLine.length > 0) {
        updatedLines.push(joinLine(currentLine, indentation, linePrefix));
    }

    return updatedLines;
}

function joinLine(parts: string[], indentation: string, linePrefix: string): string {
    const text = parts.join(" ");
    if (linePrefix.length === 0) {
        return `${indentation}${text}`;
    }
    return text.length > 0 ? `${indentation}${linePrefix} ${text}` : `${indentation}${linePrefix}`;
}

export function matchAll(
    document: TextDocument,
    selections: readonly Selection[] | undefined,
    regex: RegExp,
    callback: (match: RegExpExecArray, range: Range) => void,
) {
    // Ranges are always the full line. We don't format parts of a comment.
    const ranges = selections?.map((selection) => {
        if (selection.isSingleLine) {
            return document.lineAt(selection.start.line).range;
        }
        return new Range(
            selection.start.with(undefined, 0),
            document.lineAt(selection.end.line).range.end,
        );
    });

    for (const range of ranges ?? [undefined]) {
        const offset = range != null ? document.offsetAt(range.start) : 0;
        const matches = document.getText(range).matchAll(regex);

        for (const match of matches) {
            if (match.index == null) {
                continue;
            }
            callback(
                match,
                new Range(
                    document.positionAt(offset + match.index),
                    document.positionAt(offset + match.index + match[0].length),
                ),
            );
        }
    }
}
