import * as vscode from "vscode";
import { BaseCommentFormatter } from "./BaseCommentFormatter";
import type { CommentMatch } from "./types";

export class LuaFormatter extends BaseCommentFormatter {
    protected commentsRegex = /^[\t ]*(--.*)/gm;
    protected linePrefix: string = "--";

    constructor(lineWidth: number) {
        super(lineWidth);
    }

    protected parseMatch(match: RegExpExecArray): CommentMatch {
        return {
            text: match[1],
            isBlockComment: false
        };
    }

    protected parseBlockComment(
        _range: vscode.Range,
        _text: string,
        _indentation: string
    ): string | undefined {
        throw Error("Block comments are not supported for Lua");
    }
}
