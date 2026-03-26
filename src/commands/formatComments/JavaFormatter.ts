import type * as vscode from "vscode";
import { BaseCommentFormatter } from "./BaseCommentFormatter";
import type { CommentMatch } from "./types";
import { isValidLine, parseTokens } from "./utils";

export class JavaFormatter extends BaseCommentFormatter {
    protected regex = /(?:^[\t ]*)(?:(\/\*\*?[\s\S]*?\*\/)|(\/\/.*))/gm;
    protected linePrefix: string = "//";

    protected parseMatch(match: RegExpExecArray): CommentMatch {
        const isBlockComment = match[1] != null;
        const text = isBlockComment ? match[1] : match[2];
        return { text, isBlockComment };
    }

    protected parseBlockComment(
        range: vscode.Range,
        text: string,
        indentation: string,
    ): string | undefined {
        const isDoc = text.startsWith("/**");
        // Extract the text between the "/**" and "*/"
        const textContent = isDoc ? text.slice(3, -2) : text.slice(2, -2);
        const linePrefix = isDoc ? " *" : "";
        const lines = textContent.split("\n");
        const tokens = lines.flatMap((sourceLine, index) => {
            let line = sourceLine.trim();
            if (line[0] === "*") {
                // Extract the text after the optional "*"
                line = line.slice(1).trim();
            }
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
            const start = isDoc && !isSingleLine ? "/**" : "/*";
            const end = isDoc ? " */" : "*/";
            if (isSingleLine) {
                const line = updatedLines[0].trimStart();
                if (isDoc) {
                    return `${indentation}${start}${line}${end}`;
                }
                return `${indentation}${start} ${line} ${end}`;
            }
            return `${indentation}${start}\n${updatedLines.join("\n")}\n${indentation}${end}`;
        })();

        // The indentation is not part of the text being passed in.
        const hasChanges = `${indentation}${text}` !== updatedText;

        return hasChanges ? updatedText : undefined;
    }
}
