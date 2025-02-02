import * as vscode from "vscode";

export interface CommentFormatter {
    parse(document: vscode.TextDocument): Change[];
}

export interface CommentMatch {
    text: string;
    isBlockComment: boolean;
}

export interface Change {
    range: vscode.Range;
    text: string;
}

export interface Line {
    text: string;
    indentation: string;
    range: vscode.Range;
}

export interface Token {
    text: string;
    preserve: boolean;
}
