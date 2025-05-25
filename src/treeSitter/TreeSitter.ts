import fs from "node:fs";
import path from "node:path";
import * as vscode from "vscode";
import type { Node, Point, Query, QueryMatch } from "web-tree-sitter";
import type { ParseTreeExtension } from "../typings/parserTree";

export type ScopeName = "class.name" | "startTag.name" | "comment";

export interface Scope {
    name: ScopeName;
    range: vscode.Range;
    domain: vscode.Range;
    node: Node;
}

export class TreeSitter {
    private queries: Map<string, Query | undefined> = new Map();

    constructor(private parseTreeExtension: ParseTreeExtension) {}

    getRootNode(document: vscode.TextDocument): Node {
        return this.parseTreeExtension.getTree(document).rootNode;
    }

    findsSmallestContainingPosition(
        document: vscode.TextDocument,
        name: ScopeName,
        position: vscode.Position,
    ): Scope | undefined {
        const scopes = this.parse(document);

        let smallest: Scope | undefined = undefined;

        for (const scope of scopes) {
            if (scope.name === name && scope.domain.contains(position)) {
                if (smallest == null || smallest.domain.contains(scope.domain)) {
                    smallest = scope;
                }
            }
        }

        return smallest;
    }

    private parse(document: vscode.TextDocument): Scope[] {
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

        return this.parseTreeExtension.createQuery(languageId, querySource);
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
        const domainRange = domain != null ? nodeToRange(domain.node) : undefined;

        for (const capture of match.captures) {
            if (capture === domain) {
                continue;
            }

            const { name, node } = capture;
            const range = nodeToRange(node);

            results.push({
                name: name as ScopeName,
                node,
                range,
                domain: domainRange ?? range,
            });
        }
    }

    return results;
}

function nodeToRange(node: Node): vscode.Range {
    return new vscode.Range(pointToPosition(node.startPosition), pointToPosition(node.endPosition));
}

function pointToPosition(point: Point): vscode.Position {
    return new vscode.Position(point.row, point.column);
}
