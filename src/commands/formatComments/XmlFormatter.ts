import * as vscode from "vscode";
import type { Change, CommentFormatter, CommentMatch } from "./types";
import { isValidLine, parseTokens } from "./utils";

const prefix = "<!--";
const suffix = "-->";

export class XmlFormatter implements CommentFormatter {
    private regex = /^[\t ]*(<!--[\s\S]*?-->)/gm;

    constructor(private lineWidth: number) {}

    public parse(document: vscode.TextDocument): Change[] {
        const matches = document.getText().matchAll(this.regex);
        const changes: Change[] = [];

        for (const match of matches) {
            if (match.index == null) {
                continue;
            }
            const matchText = match[0];
            const range = new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + matchText.length)
            );

            const text = match[1];
            const indentation = matchText.slice(0, matchText.length - text.length);

            const newText = this.parseBlockComment(range, text, indentation);
            if (newText != null) {
                changes.push({ range, text: newText });
            }
        }

        return changes;
    }

    private parseMatch(match: RegExpExecArray): CommentMatch {
        const isBlockComment = match[1] != null;
        const text = isBlockComment ? match[1] : match[2];
        return { text, isBlockComment };
    }

    private parseBlockComment(
        range: vscode.Range,
        text: string,
        indentation: string
    ): string | undefined {
        // Extract the text between the "<!--" and "-->"
        const textContent = text.slice(prefix.length, -suffix.length);
        const linePrefix = "";
        const lines = textContent.split("\n");
        const tokens = lines.flatMap((line, index) => {
            const text = line.trim();
            if (isValidLine(text)) {
                // Split on spaces
                return text.split(/[ ]+/g).map((token) => ({ text: token, preserve: false }));
            }
            if (text.length === 0 && (index === 0 || index === lines.length - 1)) {
                return [];
            }
            return [{ text, preserve: true }];
        });

        const updatedLines = parseTokens(tokens, this.lineWidth, indentation, linePrefix);

        const updatedText = (() => {
            const isSingleLine = lines.length === 1 && updatedLines.length === 1;
            if (isSingleLine) {
                const text = updatedLines[0].trimStart();
                return `${indentation}${prefix} ${text} ${suffix}`;
            }
            return `${indentation}${prefix}\n${updatedLines.join("\n")}\n${indentation}${suffix}`;
        })();

        return text !== updatedText ? updatedText : undefined;
    }
}
