import { Location, TextDocument } from "vscode";
import { SyntaxNode, Tree } from "web-tree-sitter";

export type GetTree = (document: TextDocument) => Tree;
export type GetNodeAtLocation = (location: Location) => SyntaxNode;
