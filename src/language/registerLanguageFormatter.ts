/* eslint-disable @typescript-eslint/unbound-method */
import { Disposable, EndOfLine, languages, Range, TextEdit, TextEditor, window } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { ParseTreeExtension } from "../typings/parserTree";

const columnWidth = 28;

class TalonFormatter {
    private readonly ident: string;
    private readonly eol: string;
    private lastRow: number;

    constructor(private editor: TextEditor) {
        this.ident = getIndentation(editor);
        this.eol = getEOL(editor);
        this.lastRow = 0;
        this.getNodeText = this.getNodeText.bind(this);
    }

    getText(node: SyntaxNode): string {
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

    private getNodeTextInternal(node: SyntaxNode, isIndented = false): string {
        switch (node.type) {
            case "source_file":
                return node.children
                    .map((n) => this.getNodeText(n))
                    .filter(Boolean)
                    .join(this.eol);

            case "matches": {
                if (node.children.length === 0) {
                    return "";
                }
                const text = node.children.map((n) => this.getNodeText(n)).join(this.eol);
                return `${text}${this.eol}-`;
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
            case "face_declaration":
            case "gamepad_declaration":
            case "settings_declaration":
                return this.getLeftRightText(node);

            case "comment":
                return isIndented ? `${this.ident}${node.text}` : node.text;

            case "expression_statement":
            case "assignment_statement": {
                const text = node.children.map((n) => this.getNodeText(n)).join(" ");
                return isIndented ? `${this.ident}${text}` : text;
            }

            case "action":
            case "key_action":
            case "sleep_action":
            case "argument_list":
            case "key_binding":
            case "face_binding":
            case "gamepad_binding":
            case "parrot_binding":
            case "tag_import_declaration":
                return node.children.map((n) => this.getNodeText(n)).join("");

            case "match_modifier":
            case ":":
            case ",":
                return `${node.text} `;

            case "implicit_string":
                return node.text.trim();

            case "rule":
            case "tag_binding":
            case "settings_binding":
            case "key(":
            case "sleep(":
            case "gamepad(":
            case "face(":
            case "parrot(":
            case "identifier":
            case "variable":
            case "string":
            case "integer":
            case "float":
            case "=":
            case "(":
            case ")":
                return node.text;

            default:
                console.warn(`Unknown syntax node type '${node.type}'`);
                return node.text;
        }
    }
}

function provideDocumentFormattingEditsTalon(parseTreeExtension: ParseTreeExtension): TextEdit[] {
    const editor = window.activeTextEditor;

    if (editor == null) {
        return [];
    }

    const tree = parseTreeExtension.getTree(editor.document);

    if (tree.rootNode.hasError()) {
        return [];
    }

    const formatter = new TalonFormatter(editor);
    const newText = formatter.getText(tree.rootNode);
    const originalText = editor.document.getText();

    if (originalText === newText) {
        return [];
    }

    return [
        TextEdit.replace(
            new Range(
                editor.document.lineAt(0).range.start,
                editor.document.lineAt(editor.document.lineCount - 1).range.end
            ),
            newText
        )
    ];
}

function getIndentation(editor: TextEditor): string {
    return new Array(editor.options.tabSize ?? 4)
        .fill(editor.options.insertSpaces ? " " : "\t")
        .join("");
}

function getEOL(editor: TextEditor): string {
    return editor.document.eol === EndOfLine.LF ? "\n" : "\r\n";
}

export function registerLanguageFormatter(parseTreeExtension: ParseTreeExtension): Disposable {
    return languages.registerDocumentFormattingEditProvider(
        { language: "talon" },
        {
            provideDocumentFormattingEdits: async () => {
                try {
                    return provideDocumentFormattingEditsTalon(parseTreeExtension);
                } catch (ex) {
                    const err = ex as Error;
                    await window.showErrorMessage(err.message);
                    console.error(err.stack);
                }
            }
        }
    );
}
