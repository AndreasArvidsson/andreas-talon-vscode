import type { Range, Selection, TextDocument } from "vscode";

export interface CommentFormatter {
    parse(document: TextDocument, selections?: readonly Selection[]): Change[];
}

export interface CommentMatch {
    text: string;
    isBlockComment: boolean;
}

export interface Change {
    range: Range;
    text: string;
}

export interface Line {
    text: string;
    indentation: string;
    range: Range;
}

export interface Token {
    text: string;
    preserve: boolean;
}
