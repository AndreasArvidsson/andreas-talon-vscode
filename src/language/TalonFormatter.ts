import type { TextDocument } from "vscode";
import type { SyntaxNode } from "web-tree-sitter";
import { configuration } from "../util/configuration";
import type { LanguageFormatterTree } from "./registerLanguageFormatters";

export const talonFormatter: LanguageFormatterTree = {
    getText(document: TextDocument, node: SyntaxNode, indentation: string): string {
        const columnWidth = getColumnWidth(document, node.text);
        const formatter = new TalonFormatter(indentation, columnWidth);
        return formatter.getText(node);
    }
};

class TalonFormatter {
    private lastRow = 0;

    constructor(
        private indent: string,
        private columnWidth: number | undefined
    ) {}

    getText(node: SyntaxNode): string {
        return this.getNodeText(node) + "\n";
    }

    private getLeftRightText(node: SyntaxNode): string {
        const { children } = node;
        const isMultiline = children[2].startPosition.row > children[1].endPosition.row;
        const left = this.getNodeText(children[0]);
        const leftWithColon = `${left}:`;
        const leftWithPadding = (() => {
            if (isMultiline) {
                return leftWithColon;
            }
            if (this.columnWidth == null) {
                return `${leftWithColon} `;
            }
            return `${leftWithColon} `.padEnd(this.columnWidth);
        })();
        const nl = isMultiline ? "\n" : "";
        const right = children
            .slice(2)
            .map((n) => this.getNodeText(n, isMultiline))
            .join("\n");
        return `${leftWithPadding}${nl}${right}`;
    }

    private getNodeText(node: SyntaxNode, isIndented = false): string {
        const nl = node.startPosition.row > this.lastRow + 1 ? "\n" : "";
        this.lastRow = node.endPosition.row;
        const text = this.getNodeTextInternal(node, isIndented);
        this.lastRow = node.endPosition.row;
        return `${nl}${text}`;
    }

    private pairWithChildren(node: SyntaxNode) {
        const { children } = node;
        const pre = children[0].text;
        const post = children[children.length - 1].text;
        const middle = children
            .slice(1, -1)
            .map((n) => this.getNodeText(n))
            .join(" ");
        return `${pre}${middle}${post}`;
    }

    private getNodeTextInternal(node: SyntaxNode, isIndented = false): string {
        switch (node.type) {
            case "source_file":
                return node.children
                    .map((n) => this.getNodeText(n))
                    .filter(Boolean)
                    .join("\n");

            case "matches": {
                if (node.children.length < 2) {
                    return "";
                }
                return node.children.map((n) => this.getNodeText(n)).join("\n");
            }

            case "declarations":
                return node.children.map((n) => this.getNodeText(n)).join("\n");

            case "match":
                return node.children.map((n) => this.getNodeText(n)).join("");

            case "block":
                return node.children.map((n) => this.getNodeText(n, isIndented)).join("\n");

            case "command_declaration":
            case "key_binding_declaration":
            case "parrot_declaration":
            case "noise_declaration":
            case "face_declaration":
            case "gamepad_declaration":
            case "deck_declaration":
            case "settings_declaration":
                return this.getLeftRightText(node);

            case "comment": {
                // When using crlf eol comments have a trailing `\r`
                const text = node.text.trimEnd();
                return isIndented ? `${this.indent}${text}` : text;
            }

            case "expression_statement":
            case "assignment_statement": {
                const text = node.children.map((n) => this.getNodeText(n)).join(" ");
                return isIndented ? `${this.indent}${text}` : text;
            }

            case "rule":
            case "action":
            case "key_action":
            case "sleep_action":
            case "argument_list":
            case "key_binding":
            case "face_binding":
            case "gamepad_binding":
            case "parrot_binding":
            case "noise_binding":
            case "deck_binding":
            case "tag_import_declaration":
                return node.children.map((n) => this.getNodeText(n)).join("");

            case "match_modifier":
            case ":":
            case ",":
                return `${node.text} `;

            case "implicit_string":
                return node.text.trim();

            case "parenthesized_rule":
            case "optional":
                return this.pairWithChildren(node);

            case "seq":
            case "choice":
                return node.children.map((n) => this.getNodeText(n)).join(" ");

            case "tag_binding":
            case "settings_binding":
            case "capture":
            case "list":
            case "key(":
            case "sleep(":
            case "gamepad(":
            case "face(":
            case "parrot(":
            case "noise(":
            case "identifier":
            case "variable":
            case "word":
            case "binary_operator":
            case "string":
            case "integer":
            case "float":
            case "start_anchor":
            case "end_anchor":
            case "repeat":
            case "deck(":
            case "(":
            case ")":
            case "=":
            case "-":
            case "|":
                return node.text;

            default:
                console.warn(`Unknown syntax node type '${node.type}'`);
                return node.text;
        }
    }
}

function getColumnWidth(document: TextDocument, text: string) {
    const match = text.match(/# fmt: columnWidth=(\d+)/);
    if (match != null) {
        return parseInt(match[1]);
    }
    return configuration.talonFormatter.columnWidth(document);
}
