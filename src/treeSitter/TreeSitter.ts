import fs from "node:fs";
import path from "node:path";
import * as vscode from "vscode";
import type { Point, Query, QueryMatch, SyntaxNode } from "web-tree-sitter";
import type { ParseTreeExtension } from "../typings/parserTree";

export interface Scope {
    name: string;
    range: vscode.Range;
    domain: vscode.Range;
    node: SyntaxNode;
}

export class TreeSitter {
    private queries: Map<string, Query | undefined> = new Map();

    constructor(private parseTreeExtension: ParseTreeExtension) {}

    getRootNode(document: vscode.TextDocument): SyntaxNode {
        return this.parseTreeExtension.getTree(document).rootNode;
    }

    getNodeAtLocation(location: vscode.Location): SyntaxNode {
        return this.parseTreeExtension.getNodeAtLocation(location);
    }

    parse(document: vscode.TextDocument): Scope[] {
        const matches = this.getMatches(document);
        return matchesToScopes(matches);
    }

    private getMatches(document: vscode.TextDocument): QueryMatch[] {
        const root = this.getRootNode(document);
        return this.getQuery(document.languageId)?.matches(root) ?? [];
    }

    private getQuery(languageId: string): Query | undefined {
        if (!this.queries.has(languageId)) {
            const query = this.createQuery(languageId);
            this.queries.set(languageId, query);
        }

        return this.queries.get(languageId);
    }

    private createQuery(languageId: string): Query | undefined {
        const querySource = loadQueryFileForLanguage(languageId);

        if (querySource == null) {
            return undefined;
        }

        return this.parseTreeExtension.getLanguage(languageId)?.query(querySource);
    }
}

function loadQueryFileForLanguage(languageId: string): string | undefined {
    const file = getQueryFile(languageId);

    if (!fs.existsSync(file)) {
        return undefined;
    }

    return loadQueryFile(file);
}

function loadQueryFile(file: string): string {
    const content = fs.readFileSync(file, "utf8");

    return content.replace(/^;; import (\w+)$/gm, (_match, filename: string) => {
        const importFile = getQueryFile(filename);
        return loadQueryFile(importFile);
    });
}

function getQueryFile(name: string): string {
    return path.join(__dirname, `queries/${name}.scm`);
}

function matchesToScopes(matches: QueryMatch[]): Scope[] {
    const results: Scope[] = [];

    for (const match of matches) {
        const domain = match.captures.find((capture) => capture.name === "_.domain");

        for (const capture of match.captures) {
            if (capture.name.endsWith(".domain")) {
                continue;
            }

            const { name, node } = capture;
            const range = nodeToRange(node);
            const domainRange = domain != null ? nodeToRange(domain.node) : range;

            results.push({
                name,
                node,
                range,
                domain: domainRange
            });
        }
    }

    return results;
}

function nodeToRange(node: SyntaxNode): vscode.Range {
    return new vscode.Range(pointToPosition(node.startPosition), pointToPosition(node.endPosition));
}

function pointToPosition(point: Point): vscode.Position {
    return new vscode.Position(point.row, point.column);
}
