import * as vscode from "vscode";
import { BaseCommentFormatter } from "./BaseCommentFormatter";
import type { CommentMatch } from "./types";

export class JavascriptFormatter extends BaseCommentFormatter {
    protected commentsRegex = /(?:^[\t ]*)(?:(\/\*\*?[\s\S]*?\*\/)|(\/\/.*))/gm;
    protected linePrefix: string = "//";

    constructor(lineWidth: number) {
        super(lineWidth);
    }

    protected parseMatch(match: RegExpExecArray): CommentMatch {
        const isBlockComment = match[1] != null;
        const text = isBlockComment ? match[1] : match[2];
        return { text, isBlockComment };
    }

    protected parseBlockComment(
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
}
