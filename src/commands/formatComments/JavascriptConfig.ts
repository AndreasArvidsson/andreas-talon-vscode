import * as vscode from "vscode";
import type { Change, Configuration, Line } from "./types";

const LINE_PREFIX = "//";

export class JavascriptConfig implements Configuration {
    private commentsRegex = /\/\*[\s\S]*?\*\/|^[\t ]*(\/\/.*)/gm;
    private isValidLineRegex = /\w/;
    // regex: /(?:\/\*[\s\S]*?\*\/|(?:^[\t ]*\/\/.*\n?)+)/gm
    // (?:\/\*[\s\S]*?\*\/|(?:\/\/.*\n?)+)

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
            const text = match[1] ?? match[0];
            const range = new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + text.length)
            );

            if (text.startsWith("/*")) {
                const newText = this.parseBlockComment(range, text);
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

            unprocessedLines.push({ text, range });
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

    private parseBlockComment(range: vscode.Range, text: string): string | undefined {
        const lines = text.split("\n");
        lines.forEach((line) => {
            console.log(line);
        });
        return text;
    }

    private parseLineComment(lines: Line[]): string | undefined {
        const tokens = lines.flatMap((line) => line.text.slice(2).trim().split(" "));
        const updatedLines: string[] = [];
        const currentLine: string[] = [];
        let currentLineLength = LINE_PREFIX.length;

        for (const token of tokens) {
            if (currentLineLength + token.length + 1 >= this.lineWidth) {
                if (currentLine.length > 0) {
                    updatedLines.push([LINE_PREFIX, ...currentLine].join(" "));
                    currentLine.length = 0;
                    currentLineLength = LINE_PREFIX.length;
                }
            }

            currentLine.push(token);
            // Add 1 for the space between tokens
            currentLineLength += token.length + 1;
        }

        if (currentLine.length > 0) {
            updatedLines.push([LINE_PREFIX, ...currentLine].join(" "));
        }

        const hasChanges =
            lines.length !== updatedLines.length ||
            lines.some((line, index) => line.text !== updatedLines[index]);

        return hasChanges ? updatedLines.join("\n") : undefined;
    }
}
