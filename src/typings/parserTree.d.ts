import { Location, TextDocument } from "vscode";
import { SyntaxNode, Tree } from "web-tree-sitter";

export type ParseTreeExtension = {
    loadLanguage: (languageId: string) => Promise<boolean>;
    getTree: (document: TextDocument) => Tree;
    getNodeAtLocation: (location: Location) => SyntaxNode;
};
