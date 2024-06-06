import type { SyntaxNode } from "web-tree-sitter";
import type { LanguageFormatterTree } from "./registerLanguageFormatter";

const columnWidth = 28;

export class TalonFormatter implements LanguageFormatterTree {
    private lastRow = 0;
    private ident = "";
    private eol = "";

    getText(ident: string, eol: string, node: SyntaxNode): string {
        this.lastRow = 0;
        this.ident = ident;
        this.eol = eol;
        return this.getNodeText(node) + this.eol;
    }

    private getLeftRightText(node: SyntaxNode): string {
        const { children } = node;
        const isMultiline = children[2].startPosition.row > children[1].endPosition.row;
        const left = this.getNodeText(children[0]);
        const leftWithColon = `${left}:`;
        const leftWithPadding = isMultiline
            ? leftWithColon
            : `${leftWithColon} `.padEnd(columnWidth);
        const nl = isMultiline ? this.eol : "";
        const right = children
            .slice(2)
            .map((n) => this.getNodeText(n, isMultiline))
            .join(this.eol);
        return `${leftWithPadding}${nl}${right}`;
    }

    private getNodeText(node: SyntaxNode, isIndented = false): string {
        const nl = node.startPosition.row > this.lastRow + 1 ? this.eol : "";
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
                    .join(this.eol);

            case "matches": {
                if (node.children.length < 2) {
                    return "";
                }
                return node.children.map((n) => this.getNodeText(n)).join(this.eol);
            }

            case "declarations":
                return node.children.map((n) => this.getNodeText(n)).join(this.eol);

            case "match":
                return node.children.map((n) => this.getNodeText(n)).join("");

            case "block":
                return node.children.map((n) => this.getNodeText(n, isIndented)).join(this.eol);

            case "command_declaration":
            case "key_binding_declaration":
            case "parrot_declaration":
            case "noise_declaration":
            case "face_declaration":
            case "gamepad_declaration":
            case "settings_declaration":
                return this.getLeftRightText(node);

            case "comment": {
                // When using crlf eol comments have a trailing `\r`
                const text = node.text.trimEnd();
                return isIndented ? `${this.ident}${text}` : text;
            }

            case "expression_statement":
            case "assignment_statement": {
                const text = node.children.map((n) => this.getNodeText(n)).join(" ");
                return isIndented ? `${this.ident}${text}` : text;
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
