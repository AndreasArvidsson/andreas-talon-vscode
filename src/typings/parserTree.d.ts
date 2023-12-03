import * as vscode from "vscode";
import type { Language, SyntaxNode, Tree } from "web-tree-sitter";

export type ParseTreeExtension = {
    loadLanguage: (languageId: string) => Promise<boolean>;
    getLanguage(languageId: string): Language | undefined;
    getTree: (document: vscode.TextDocument) => Tree;
    getNodeAtLocation: (location: vscode.Location) => SyntaxNode;
};
