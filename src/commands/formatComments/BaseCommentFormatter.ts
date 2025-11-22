import type { Range, Selection, TextDocument } from "vscode";
import type { Change, CommentFormatter, CommentMatch, Line } from "./types";
import { isValidLine, matchAll, parseTokens } from "./utils";

export abstract class BaseCommentFormatter implements CommentFormatter {
    protected abstract regex: RegExp;
    protected abstract linePrefix: string;

    constructor(protected lineWidth: number) {}

    protected abstract parseMatch(match: RegExpExecArray): CommentMatch;

    public parse(
        document: TextDocument,
        selections?: readonly Selection[],
    ): Change[] {
        const changes: Change[] = [];
        const unprocessedLines: Line[] = [];

        const processLines = () => {
            const newText = this.parseLineComment(unprocessedLines);
            if (newText != null) {
                const range = unprocessedLines[0].range.union(
                    unprocessedLines[unprocessedLines.length - 1].range,
                );
                changes.push({ range, text: newText });
            }
            unprocessedLines.length = 0;
        };

        matchAll(document, selections, this.regex, (match, range) => {
            const matchText = match[0];
            const { text, isBlockComment } = this.parseMatch(match);
            const indentation = matchText.slice(
                0,
                matchText.length - text.length,
            );

            if (isBlockComment) {
                const newText = this.parseBlockComment(
                    range,
                    text,
                    indentation,
                );
                if (newText != null) {
                    changes.push({ range, text: newText });
                }
                return;
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
        });

        // Process any remaining lines
        if (unprocessedLines.length > 0) {
            processLines();
        }

        return changes;
    }

    protected abstract parseBlockComment(
        range: Range,
        text: string,
        indentation: string,
    ): string | undefined;

    private parseLineComment(lines: Line[]): string | undefined {
        const indentation = lines[0].indentation;
        const tokens = lines.flatMap((line) => {
            // Extract the text after the "//"
            const text = line.text.slice(this.linePrefix.length).trimStart();
            if (isValidLine(text)) {
                // Split on spaces
                return text
                    .split(/[ ]+/g)
                    .map((token) => ({ text: token, preserve: false }));
            }
            return [{ text, preserve: true }];
        });

        const updatedLines = parseTokens(
            tokens,
            this.lineWidth,
            indentation,
            this.linePrefix,
        );
        const hasChanges =
            lines.length !== updatedLines.length ||
            // The indentation is not part of the text being passed in.
            lines.some(
                (line, index) =>
                    `${indentation}${line.text}` !== updatedLines[index],
            );

        return hasChanges ? updatedLines.join("\n") : undefined;
    }
}
