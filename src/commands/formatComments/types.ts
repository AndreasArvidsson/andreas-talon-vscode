import * as vscode from "vscode";

export interface Configuration {
    parse(document: vscode.TextDocument): Change[];
}

export interface Change {
    range: vscode.Range;
    newText: string;
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
