import type { TextDocument, Uri } from "vscode";
import type { Query, Tree } from "web-tree-sitter";

export type ParseTreeExtension = {
    loadLanguage(languageId: string): Promise<boolean>;
    createQuery(languageId: string, source: string): Query | undefined;
    getTree(document: TextDocument): Tree;
    getTreeForUri(uri: Uri): Tree;
};
