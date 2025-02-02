import * as vscode from "vscode";
import type { Change, Configuration, Line, Token } from "./types";

export class JavascriptConfig implements Configuration {
    private commentsRegex = /(?:^[\t ]*)(?:(\/\*\*?[\s\S]*?\*\/)|(\/\/.*))/gm;
    private isValidLineRegex = /\w/;

    constructor(private lineWidth: number) {}

    parse(document: vscode.TextDocument): Change[] {
        const matches = document.getText().matchAll(this.commentsRegex);
        const changes: Change[] = [];
        const unprocessedLines: Line[] = [];

        const processLines = () => {
            const newText = this.parseLineComment(unprocessedLines);
            if (newText != null) {
                const range = unprocessedLines[0].range.union(
                    unprocessedLines[unprocessedLines.length - 1].range
                );
                changes.push({ range, newText });
            }
            unprocessedLines.length = 0;
        };

        for (const match of matches) {
            if (match.index == null) {
                continue;
            }
            const matchText = match[0];
            const range = new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + matchText.length)
            );

            const isBlockComment = match[1] != null;
            const text = isBlockComment ? match[1] : match[2];
            const indentation = matchText.slice(0, matchText.length - text.length);

            if (isBlockComment) {
                const newText = this.parseBlockComment(range, text, indentation);
                if (newText != null) {
                    changes.push({ range, newText });
                }
                continue;
            }

            // Non consecutive line comments. Process the previous lines.
            if (
                unprocessedLines.length > 0 &&
                unprocessedLines[unprocessedLines.length - 1].range.end.line !==
                    range.start.line - 1
            ) {
                processLines();
            }

            unprocessedLines.push({ range, text, indentation });
        }

        // Process any remaining lines
        if (unprocessedLines.length > 0) {
            processLines();
        }

        return changes;
    }

    private isValidLine(text: string): boolean {
        return this.isValidLineRegex.test(text);
    }

    private parseBlockComment(
        range: vscode.Range,
        text: string,
        indentation: string
    ): string | undefined {
        const isJsDoc = text.startsWith("/**");
        // Extract the text between the "/**" and "*/"
        const textContent = isJsDoc ? text.slice(3, -2) : text.slice(2, -2);
        const linePrefix = isJsDoc ? " *" : "";
        const lines = textContent.split("\n");
        const tokens = lines.flatMap((line, index) => {
            let text = line.trim();
            if (text[0] === "*") {
                // Extract the text after the optional "*"
                text = text.slice(1).trim();
            }
            if (this.isValidLine(text)) {
                // Split on spaces
                return text.split(/[ ]+/g).map((token) => ({ text: token, preserve: false }));
            }
            if (text.length === 0 && (index === 0 || index === lines.length - 1)) {
                return [];
            }
            return [{ text, preserve: true }];
        });

        const updatedLines = this.parseTokens(tokens, indentation, linePrefix);

        const updatedText = (() => {
            const isSingleLine = lines.length === 1 && updatedLines.length === 1;
            const start = isJsDoc && !isSingleLine ? "/**" : "/*";
            const end = isJsDoc ? " */" : "*/";
            if (isSingleLine) {
                const text = updatedLines[0].trimStart();
                if (isJsDoc) {
                    return `${indentation}${start}${text}${end}`;
                }
                return `${indentation}${start} ${text} ${end}`;
            }
            return `${indentation}${start}\n${updatedLines.join("\n")}\n${indentation}${end}`;
        })();

        return text !== updatedText ? updatedText : undefined;
    }

    private parseLineComment(lines: Line[]): string | undefined {
        const indentation = lines[0].indentation;
        const tokens = lines.flatMap((line) => {
            // Extract the text after the "//"
            const text = line.text.slice(2).trimStart();
            if (this.isValidLine(text)) {
                // Split on spaces
                return text.split(/[ ]+/g).map((token) => ({ text: token, preserve: false }));
            }
            return [{ text, preserve: true }];
        });

        const updatedLines = this.parseTokens(tokens, indentation, "//");
        const hasChanges =
            lines.length !== updatedLines.length ||
            lines.some((line, index) => line.text !== updatedLines[index]);

        return hasChanges ? updatedLines.join("\n") : undefined;
    }

    private parseTokens(tokens: Token[], indentation: string, linePrefix: string): string[] {
        const updatedLines: string[] = [];
        const currentLine: string[] = [];
        let currentLineLength = indentation.length + linePrefix.length;

        for (const { text, preserve } of tokens) {
            if (preserve || currentLineLength + text.length + 1 > this.lineWidth) {
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
}

function joinLine(parts: string[], indentation: string, linePrefix: string): string {
    const text = parts.join(" ");
    if (linePrefix.length === 0) {
        return `${indentation}${text}`;
    }
    return text.length > 0 ? `${indentation}${linePrefix} ${text}` : `${indentation}${linePrefix}`;
}
