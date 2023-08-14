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
import { ParseTreeExtension } from "../typings/parserTree";
import { SnippetFormatter } from "./SnippetFormatter";
import { TalonFormatter } from "./TalonFormatter";
import { TreeSitterFormatter } from "./TreeSitterFormatter";

export interface LanguageFormatterTree {
    getText(ident: string, eol: string, node: SyntaxNode): string;
}

export interface LanguageFormatterText {
    getText(ident: string, eol: string, text: string): string;
}

function provideDocumentFormattingEditsForTree(
    parseTreeExtension: ParseTreeExtension,
    document: TextDocument,
    options: FormattingOptions,
    formatter: LanguageFormatterTree
): TextEdit[] {
    const tree = parseTreeExtension.getTree(document);

    if (tree.rootNode.hasError()) {
        console.warn(`Abort document formatting: Syntax tree has error`);
        return [];
    }

    const [indentation, eol] = parseOptions(document, options);
    const newText = formatter.getText(indentation, eol, tree.rootNode);
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
    const indentation = options.insertSpaces ? new Array(options.tabSize).fill(" ").join("") : "\t";
    const eol = document.eol === EndOfLine.LF ? "\n" : "\r\n";
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

export function registerLanguageFormatter(parseTreeExtension: ParseTreeExtension): Disposable {
    return Disposable.from(
        languages.registerDocumentFormattingEditProvider("talon", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEditsForTree(
                    parseTreeExtension,
                    document,
                    options,
                    new TalonFormatter()
                )
        }),
        languages.registerDocumentFormattingEditProvider("scm", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEditsForTree(
                    parseTreeExtension,
                    document,
                    options,
                    new TreeSitterFormatter()
                )
        }),
        languages.registerDocumentFormattingEditProvider("snippet", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEditsForText(document, options, new SnippetFormatter())
        })
    );
}
