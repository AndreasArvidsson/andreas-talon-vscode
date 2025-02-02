import * as vscode from "vscode";
import type { Change, CommentFormatter, CommentMatch, Line, Token } from "./types";

export abstract class BaseCommentFormatter implements CommentFormatter {
    protected commentsRegex: RegExp = /./;
    protected linePrefix: string = "";
    private isValidLineRegex = /\w/;

    constructor(private lineWidth: number) {}

    protected abstract parseMatch(match: RegExpExecArray): CommentMatch;

    public parse(document: vscode.TextDocument): Change[] {
        const matches = document.getText().matchAll(this.commentsRegex);
        const changes: Change[] = [];
        const unprocessedLines: Line[] = [];

        const processLines = () => {
            const newText = this.parseLineComment(unprocessedLines);
            if (newText != null) {
                const range = unprocessedLines[0].range.union(
                    unprocessedLines[unprocessedLines.length - 1].range
                );
                changes.push({ range, text: newText });
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

            const { text, isBlockComment } = this.parseMatch(match as RegExpExecArray);
            const indentation = matchText.slice(0, matchText.length - text.length);

            if (isBlockComment) {
                const newText = this.parseBlockComment(range, text, indentation);
                if (newText != null) {
                    changes.push({ range, text: newText });
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

    protected isValidLine(text: string): boolean {
        return this.isValidLineRegex.test(text);
    }

    protected abstract parseBlockComment(
        range: vscode.Range,
        text: string,
        indentation: string
    ): string | undefined;

    private parseLineComment(lines: Line[]): string | undefined {
        const indentation = lines[0].indentation;
        const tokens = lines.flatMap((line) => {
            // Extract the text after the "//"
            const text = line.text.slice(this.linePrefix.length).trimStart();
            if (this.isValidLine(text)) {
                // Split on spaces
                return text.split(/[ ]+/g).map((token) => ({ text: token, preserve: false }));
            }
            return [{ text, preserve: true }];
        });

        const updatedLines = this.parseTokens(tokens, indentation, this.linePrefix);
        const hasChanges =
            lines.length !== updatedLines.length ||
            lines.some((line, index) => line.text !== updatedLines[index]);

        return hasChanges ? updatedLines.join("\n") : undefined;
    }

    protected parseTokens(tokens: Token[], indentation: string, linePrefix: string): string[] {
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
