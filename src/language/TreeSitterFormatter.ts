import type { TextDocument } from "vscode";
import type { Node } from "web-tree-sitter";
import type { LanguageFormatterTree } from "./registerLanguageFormatters";

export const treeSitterFormatter: LanguageFormatterTree = {
    getText(document: TextDocument, node: Node, indentation: string): string {
        const formatter = new TreeSitterFormatter(indentation);
        return formatter.getText(node);
    },
};

export class TreeSitterFormatter {
    private lastRow = 0;

    constructor(private indentation: string) {}

    getText(node: Node): string {
        return this.getNodeText(node, 0) + "\n";
    }

    private getNodeText(node: Node, numIndents: number): string {
        const nl = node.startPosition.row > this.lastRow + 1 ? "\n" : "";
        this.lastRow = node.endPosition.row;
        const text = this.getNodeTextInternal(node, numIndents);
        this.lastRow = node.endPosition.row;
        return `${nl}${text}`;
    }

    private getNamedNodeText(node: Node, numIndents: number): string {
        const index = node.children.findIndex((n) => n.type === ")");
        const first = node.children
            .slice(0, 2)
            .map((n) => n.text)
            .join("");
        const last = node.children
            .slice(index)
            .map((n) => this.getNodeText(n, 0))
            .join("");
        const interior = node.children
            .slice(2, index)
            .map((n) => this.getNodeText(n, numIndents + 1));
        // Inline node
        if (interior.length === 0) {
            return `${this.getIndent(numIndents)}${first}${last}`;
        }
        // Multiline node
        return [
            `${this.getIndent(numIndents)}${first}`,
            ...interior,
            `${this.getIndent(numIndents)}${last}`,
        ].join("\n");
    }

    private getListText(node: Node, numIndents: number): string {
        const index = node.children.findIndex((n) => n.type === "]");
        const first = node.children[0].text;
        const last = node.children
            .slice(index)
            .map((n) => n.text)
            .join(" ");
        const parts = [
            `${this.getIndent(numIndents)}${first}`,
            ...node.children
                .slice(1, index)
                .map((n) => this.getNodeText(n, numIndents + 1)),
            `${this.getIndent(numIndents)}${last}`,
        ];
        return parts.join("\n");
    }

    private getPredicateText(node: Node, numIndents: number): string {
        const first = node.children[0].text;
        const last = node.children[node.children.length - 1].text;
        const parts = [
            node.children
                .slice(1, 4)
                .map((n) => n.text)
                .join(""),
            ...node.children[node.children.length - 2].children.map(
                (n) => n.text,
            ),
        ];
        // Inline predicate
        if (node.startPosition.row === node.endPosition.row) {
            const text = `${first}${parts.join(" ")}${last}`;
            return `${this.getIndent(numIndents)}${text}`;
        }
        // Multiline predicate
        return [
            `${this.getIndent(numIndents)}${first}${parts[0]}`,
            ...parts
                .slice(1)
                .map((s) => `${this.getIndent(numIndents + 1)}${s}`),
            `${this.getIndent(numIndents)}${last}`,
        ].join("\n");
    }

    private getFieldDefinitionText(node: Node, numIndents: number): string {
        // Field definition directly in document root
        if (numIndents === 0) {
            return ["(_", this.getFieldDefinitionText(node, 1), ")"].join("\n");
        }
        // [lhs, ":", rhs]
        return [
            this.getIndent(numIndents),
            node.children[0].text,
            node.children[1].text,
            " ",
            this.getNodeText(node.children[2], numIndents).trimStart(),
        ].join("");
    }

    private getNodeTextInternal(node: Node, numIndents: number): string {
        switch (node.type) {
            case "program":
                return this.joinLines(node.children, 0);

            case "grouping":
                return this.joinLines(node.children, numIndents + 1);

            case "list":
                return this.getListText(node, numIndents);

            case "named_node":
                return this.getNamedNodeText(node, numIndents);

            case "predicate":
                return this.getPredicateText(node, numIndents);

            case "field_definition":
                return this.getFieldDefinitionText(node, numIndents);

            case "anonymous_node":
                return (
                    this.getIndent(numIndents) +
                    node.children
                        .map((n) => this.getNodeText(n, numIndents + 1))
                        .join("")
                );

            case ".":
            case "comment":
            case "negated_field":
                return `${this.getIndent(numIndents)}${node.text}`;

            case "(":
            case ")":
                return `${this.getIndent(numIndents - 1)}${node.text}`;

            case "capture":
                return ` ${node.text}`;

            case "#":
            case "_":
            case "predicate_type":
            case "identifier":
            case "quantifier":
            case "string":
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

    private joinLines(nodes: Node[], numIndents: number): string {
        if (nodes.length === 0) {
            return "";
        }
        const lastIsQuantifier = nodes[nodes.length - 1].type === "quantifier";
        const nodesToUse = lastIsQuantifier ? nodes.slice(0, -1) : nodes;
        const text = nodesToUse
            .map((n) => this.getNodeText(n, numIndents))
            .join("\n");
        return lastIsQuantifier
            ? `${text}${nodes[nodes.length - 1].text}`
            : text;
    }

    private getIndent(length: number): string {
        return length < 1
            ? ""
            : new Array(length).fill(this.indentation).join("");
    }
}
