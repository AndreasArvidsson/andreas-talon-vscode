import type { SyntaxNode } from "web-tree-sitter";
import type { LanguageFormatter } from "./registerLanguageFormatter";

export class TreeSitterFormatter implements LanguageFormatter {
    private lastRow = 0;
    private ident = "";
    private eol = "";

    getText(ident: string, eol: string, node: SyntaxNode): string {
        this.lastRow = 0;
        this.ident = ident;
        this.eol = eol;
        return this.getNodeText(node, 0) + this.eol;
    }

    private getNodeText(node: SyntaxNode, numIndents: number): string {
        const nl = node.startPosition.row > this.lastRow + 1 ? this.eol : "";
        this.lastRow = node.endPosition.row;
        const text = this.getNodeTextInternal(node, numIndents);
        this.lastRow = node.endPosition.row;
        return `${nl}${text}`;
    }

    private getNamedNodeText(node: SyntaxNode, numIndents: number): string {
        const parts = [this.getIndent(numIndents), node.children[0].text, node.children[1].text];
        const index = node.children.findIndex((n) => n.type === ")");
        if (index !== 2) {
            parts.push(
                this.eol,
                node.children
                    .slice(2, index)
                    .map((n) => this.getNodeText(n, numIndents + 1))
                    .join(this.eol),
                this.eol,
                this.getIndent(numIndents)
            );
        }
        parts.push(
            node.children
                .slice(index)
                .map((n) => n.text)
                .join(" ")
        );
        return parts.join("");
    }

    private getListText(node: SyntaxNode, numIndents: number): string {
        const index = node.children.findIndex((n) => n.type === "]");
        const first = node.children[0].text;
        const last = node.children
            .slice(index)
            .map((n) => n.text)
            .join(" ");
        const parts = [
            `${this.getIndent(numIndents)}${first}`,
            ...node.children.slice(1, index).map((n) => this.getNodeText(n, numIndents + 1)),
            `${this.getIndent(numIndents)}${last}`
        ];
        return parts.join(this.eol);
    }

    private getPredicateText(node: SyntaxNode, numIndents: number): string {
        const first = node.children[0].text;
        const last = node.children[node.children.length - 1].text;
        const parts = [
            node.children
                .slice(1, 4)
                .map((n) => n.text)
                .join(""),
            ...node.children[node.children.length - 2].children.map((n) => n.text)
        ];
        // Inline predicate
        if (node.startPosition.row === node.endPosition.row) {
            const text = `${first}${parts.join(" ")}${last}`;
            return `${this.getIndent(numIndents)}${text}`;
        }
        // Multiline predicate
        return [
            `${this.getIndent(numIndents)}${first}${parts[0]}`,
            ...parts.slice(1).map((s) => `${this.getIndent(numIndents + 1)}${s}`),
            `${this.getIndent(numIndents)}${last}`
        ].join(this.eol);
    }

    private getNodeTextInternal(node: SyntaxNode, numIndents: number): string {
        switch (node.type) {
            case "program":
                return node.children.map((n) => this.getNodeText(n, 0)).join(this.eol);

            case "grouping":
                return node.children.map((n) => this.getNodeText(n, 1)).join(this.eol);

            case "list":
                return this.getListText(node, numIndents);

            case "named_node":
                return this.getNamedNodeText(node, numIndents);

            case "predicate":
                return this.getPredicateText(node, numIndents);

            case "anonymous_node":
                return (
                    this.getIndent(numIndents) +
                    node.children.map((n) => this.getNodeText(n, numIndents + 1)).join("")
                );

            case ".":
            case "comment":
            case "field_definition":
            case "negated_field":
                return `${this.getIndent(numIndents)}${node.text}`;

            case "(":
            case ")":
                return `${this.getIndent(numIndents - 1)}${node.text}`;

            case "capture":
                return ` ${node.text}`;

            case "#":
            case "predicate_type":
            case "identifier":
            case "quantifier":
                return node.text;

            case "parameters": {
                const text = node.children.map((n) => n.text).join(" ");
                return ` ${text}`;
            }

            default:
                console.warn(`Unknown syntax node type '${node.type}'`);
                return node.text;
        }
    }

    private getIndent(length: number): string {
        return length < 1 ? "" : new Array(length).fill(this.ident).join("");
    }
}
