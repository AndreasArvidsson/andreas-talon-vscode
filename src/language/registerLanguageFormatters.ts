import * as editorconfig from "editorconfig";
import { Disposable, FormattingOptions, languages, Range, TextDocument, TextEdit } from "vscode";
import type { SyntaxNode } from "web-tree-sitter";
import { TreeSitter } from "../treeSitter/TreeSitter";
import { snippetFormatter } from "./SnippetFormatter";
import { talonFormatter } from "./TalonFormatter";
import { talonListFormatter } from "./TalonListFormatter";
import { treeSitterFormatter } from "./TreeSitterFormatter";

export interface LanguageFormatterTree {
    getText(ident: string, node: SyntaxNode): string;
}

export interface LanguageFormatterText {
    getText(ident: string, text: string): string;
}

function provideDocumentFormattingEditsForTree(
    treeSitter: TreeSitter,
    formatter: LanguageFormatterTree
) {
    return {
        provideDocumentFormattingEdits(
            document: TextDocument,
            options: FormattingOptions
        ): TextEdit[] {
            const rootNode = treeSitter.getRootNode(document);

            if (rootNode.hasError) {
                console.warn(`Abort document formatting: Syntax tree has error`);
                return [];
            }

            const { indentation } = parseOptions(document, options);
            const newText = formatter.getText(indentation, rootNode);
            return createTextEdits(document, newText);
        }
    };
}

function provideDocumentFormattingEditsForText(formatter: LanguageFormatterText) {
    return {
        provideDocumentFormattingEdits(
            document: TextDocument,
            options: FormattingOptions
        ): TextEdit[] {
            const { indentation } = parseOptions(document, options);
            try {
                const newText = formatter.getText(indentation, document.getText());
                return createTextEdits(document, newText);
            } catch (error) {
                console.warn((error as Error).message);
                return [];
            }
        }
    };
}

function parseOptions(document: TextDocument, options: FormattingOptions) {
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

    return { indentation };
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

export function registerLanguageFormatters(treeSitter: TreeSitter): Disposable {
    return Disposable.from(
        languages.registerDocumentFormattingEditProvider(
            "talon",
            provideDocumentFormattingEditsForTree(treeSitter, talonFormatter)
        ),
        languages.registerDocumentFormattingEditProvider(
            "talon-list",
            provideDocumentFormattingEditsForText(talonListFormatter)
        ),
        languages.registerDocumentFormattingEditProvider(
            "scm",
            provideDocumentFormattingEditsForTree(treeSitter, treeSitterFormatter)
        ),
        languages.registerDocumentFormattingEditProvider(
            "snippet",
            provideDocumentFormattingEditsForText(snippetFormatter)
        )
    );
}
