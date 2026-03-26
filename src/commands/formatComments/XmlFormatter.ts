import type { Range, Selection, TextDocument } from "vscode";
import type { Change, CommentFormatter, CommentMatch } from "./types";
import { isValidLine, matchAll, parseTokens } from "./utils";

const prefix = "<!--";
const suffix = "-->";

export class XmlFormatter implements CommentFormatter {
    private regex = /^[\t ]*(<!--[\s\S]*?-->)/gm;

    constructor(private lineWidth: number) {}

    public parse(
        document: TextDocument,
        selections?: readonly Selection[],
    ): Change[] {
        const changes: Change[] = [];

        matchAll(document, selections, this.regex, (match, range) => {
            const matchText = match[0];
            const text = match[1];
            const indentation = matchText.slice(
                0,
                matchText.length - text.length,
            );

            const newText = this.parseBlockComment(range, text, indentation);
            if (newText != null) {
                changes.push({ range, text: newText });
            }
        });

        return changes;
    }

    private parseMatch(match: RegExpExecArray): CommentMatch {
        const isBlockComment = match[1] != null;
        const text = isBlockComment ? match[1] : match[2];
        return { text, isBlockComment };
    }

    private parseBlockComment(
        range: Range,
        text: string,
        indentation: string,
    ): string | undefined {
        // Extract the text between the "<!--" and "-->"
        const textContent = text.slice(prefix.length, -suffix.length);
        const linePrefix = "";
        const lines = textContent.split("\n");
        const tokens = lines.flatMap((sourceLine, index) => {
            const line = sourceLine.trim();
            if (isValidLine(line)) {
                // Split on spaces
                return line
                    .split(/[ ]+/g)
                    .map((token) => ({ text: token, preserve: false }));
            }
            if (
                line.length === 0 &&
                (index === 0 || index === lines.length - 1)
            ) {
                return [];
            }
            return [{ text: line, preserve: true }];
        });

        const updatedLines = parseTokens(
            tokens,
            this.lineWidth,
            indentation,
            linePrefix,
        );

        const updatedText = (() => {
            const isSingleLine =
                lines.length === 1 && updatedLines.length === 1;
            if (isSingleLine) {
                const line = updatedLines[0].trimStart();
                return `${indentation}${prefix} ${line} ${suffix}`;
            }
            return `${indentation}${prefix}\n${updatedLines.join("\n")}\n${indentation}${suffix}`;
        })();

        return text !== updatedText ? updatedText : undefined;
    }
}
