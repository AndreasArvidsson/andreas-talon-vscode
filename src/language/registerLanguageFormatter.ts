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
import { TalonFormatter } from "./TalonFormatter";
import { TreeSitterFormatter } from "./TreeSitterFormatter";

export interface LanguageFormatter {
    getText(ident: string, eol: string, node: SyntaxNode): string;
}

function provideDocumentFormattingEdits(
    parseTreeExtension: ParseTreeExtension,
    document: TextDocument,
    options: FormattingOptions,
    formatter: LanguageFormatter
): TextEdit[] {
    const tree = parseTreeExtension.getTree(document);

    if (tree.rootNode.hasError()) {
        console.warn(`Abort document formatting: Syntax tree has error`);
        return [];
    }

    const indentation = options.insertSpaces ? new Array(options.tabSize).fill(" ").join("") : "\t";
    const eol = document.eol === EndOfLine.LF ? "\n" : "\r\n";
    const newText = formatter.getText(indentation, eol, tree.rootNode);

    if (document.getText() === newText) {
        return [];
    }

    return [
        TextEdit.replace(
            new Range(
                document.lineAt(0).range.start,
                document.lineAt(document.lineCount - 1).range.end
            ),
            newText
        )
    ];
}

export function registerLanguageFormatter(parseTreeExtension: ParseTreeExtension): Disposable {
    return Disposable.from(
        languages.registerDocumentFormattingEditProvider("talon", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEdits(
                    parseTreeExtension,
                    document,
                    options,
                    new TalonFormatter()
                )
        }),
        languages.registerDocumentFormattingEditProvider("scm", {
            provideDocumentFormattingEdits: (document, options) =>
                provideDocumentFormattingEdits(
                    parseTreeExtension,
                    document,
                    options,
                    new TreeSitterFormatter()
                )
        })
    );
}
