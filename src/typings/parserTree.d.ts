import * as vscode from "vscode";
import type { Node, Query, Tree } from "web-tree-sitter";

export type ParseTreeExtension = {
    loadLanguage(languageId: string): Promise<boolean>;
    createQuery(languageId: string, source: string): Query | undefined;
    getTree(document: vscode.TextDocument): Tree;
    getTreeForUri(uri: vscode.Uri): Tree;
    getNodeAtLocation(location: vscode.Location): Node;
};
