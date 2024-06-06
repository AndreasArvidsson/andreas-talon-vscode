import * as editorconfig from "editorconfig";
import {
    Disposable,
    EndOfLine,
    FormattingOptions,
    languages,
    Range,
    TextDocument,
    TextEdit
} from "vscode";
import type { SyntaxNode } from "web-tree-sitter";
import { TreeSitter } from "../treeSitter/TreeSitter";
import { snippetFormatter } from "./SnippetFormatter";
import { talonFormatter } from "./TalonFormatter";
import { treeSitterFormatter } from "./TreeSitterFormatter";

export interface LanguageFormatterTree {
    getText(ident: string, eol: string, node: SyntaxNode): string;
}

export interface LanguageFormatterText {
    getText(ident: string, eol: string, text: string): string;
}

function provideDocumentFormattingEditsForTree(
    treeSitter: TreeSitter,
    document: TextDocument,
    options: FormattingOptions,
    formatter: LanguageFormatterTree
): TextEdit[] {
    const rootNode = treeSitter.getRootNode(document);

    if (rootNode.hasError()) {
        console.warn(`Abort document formatting: Syntax tree has error`);
        return [];
    }

    const [indentation, eol] = parseOptions(document, options);
    const newText = formatter.getText(indentation, eol, rootNode);
    return createTextEdits(document, newText);
}

function provideDocumentFormattingEditsForText(
    document: TextDocument,
    options: FormattingOptions,
    formatter: LanguageFormatterText
): TextEdit[] {
    const [indentation, eol] = parseOptions(document, options);
    try {
        const newText = formatter.getText(indentation, eol, document.getText());
        return createTextEdits(document, newText);
    } catch (error) {
        console.warn((error as Error).message);
        return [];
    }
}

function parseOptions(document: TextDocument, options: FormattingOptions): [string, string] {
    const config = editorconfig.parseSync(document.uri.fsPath);

    const insertSpaces = (() => {
        switch (config.indent_style) {
            case "space":
                return true;
            case "tab":
                return false;
            default:
                return options.insertSpaces;
        }
    })();

    const tabSize = (() => {
        if (typeof config.indent_size === "number") {
            return config.indent_size;
        }
        if (config.indent_size === "tab" && typeof config.tab_width === "number") {
            return config.tab_width;
        }
        return options.tabSize;
    })();

    const indentation = insertSpaces ? new Array(tabSize).fill(" ").join("") : "\t";

    const eol = (() => {
        switch (config.end_of_line) {
            case "lf":
                return "\n";
            case "crlf":
                return "\r\n";
            default:
                return document.eol === EndOfLine.LF ? "\n" : "\r\n";
        }
    })();

    return [indentation, eol];
}

function createTextEdits(document: TextDocument, text: string): TextEdit[] {
    if (document.getText() === text) {
        return [];
    }
    return [
        TextEdit.replace(
            new Range(
                document.lineAt(0).range.start,
                document.lineAt(document.lineCount - 1).range.end
            ),
            text
        )
    ];
}

export function registerLanguageFormatter(treeSitter: TreeSitter): Disposable {
    return Disposable.from(
        languages.registerDocumentFormattingEditProvider("talon", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEditsForTree(treeSitter, document, options, talonFormatter)
        }),
        languages.registerDocumentFormattingEditProvider("scm", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEditsForTree(
                    treeSitter,
                    document,
                    options,
                    treeSitterFormatter
                )
        }),
        languages.registerDocumentFormattingEditProvider("snippet", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEditsForText(document, options, snippetFormatter)
        })
    );
}
