import type { FormattingOptions, TextDocument } from "vscode";
import { Disposable, languages, Range, TextEdit } from "vscode";
import type { Node } from "web-tree-sitter";
import type { TreeSitter } from "../treeSitter/TreeSitter";
import { getFormattingOptions } from "../util/getFormattingOptions";
import { snippetFormatter } from "./SnippetFormatter";
import { talonFormatter } from "./TalonFormatter";
import { talonListFormatter } from "./TalonListFormatter";
import { treeSitterFormatter } from "./TreeSitterFormatter";

export interface LanguageFormatterTree {
    getText(document: TextDocument, node: Node, indentation: string): string;
}

export interface LanguageFormatterText {
    getText(document: TextDocument, indentation: string): string;
}

function provideDocumentFormattingEditsForTree(
    treeSitter: TreeSitter,
    formatter: LanguageFormatterTree,
) {
    return {
        provideDocumentFormattingEdits: async (
            document: TextDocument,
            options: FormattingOptions,
        ): Promise<TextEdit[]> => {
            const rootNode = treeSitter.getRootNode(document);

            if (rootNode.hasError) {
                console.warn(
                    `Abort document formatting: Syntax tree has error`,
                );
                return [];
            }

            const { indentation } = await getFormattingOptions(
                document,
                options,
            );
            const newText = formatter.getText(document, rootNode, indentation);
            return createTextEdits(document, newText);
        },
    };
}

function provideDocumentFormattingEditsForText(
    formatter: LanguageFormatterText,
) {
    return {
        provideDocumentFormattingEdits: async (
            document: TextDocument,
            options: FormattingOptions,
        ): Promise<TextEdit[]> => {
            const { indentation } = await getFormattingOptions(
                document,
                options,
            );
            try {
                const newText = formatter.getText(document, indentation);
                return createTextEdits(document, newText);
            } catch (error) {
                console.warn((error as Error).message);
                return [];
            }
        },
    };
}

function createTextEdits(document: TextDocument, text: string): TextEdit[] {
    if (document.getText() === text) {
        return [];
    }
    return [
        TextEdit.replace(
            new Range(
                document.lineAt(0).range.start,
                document.lineAt(document.lineCount - 1).range.end,
            ),
            text,
        ),
    ];
}

export function registerLanguageFormatters(treeSitter: TreeSitter): Disposable {
    return Disposable.from(
        languages.registerDocumentFormattingEditProvider(
            "talon",
            provideDocumentFormattingEditsForTree(treeSitter, talonFormatter),
        ),
        languages.registerDocumentFormattingEditProvider(
            "talon-list",
            provideDocumentFormattingEditsForText(talonListFormatter),
        ),
        languages.registerDocumentFormattingEditProvider(
            "scm",
            provideDocumentFormattingEditsForTree(
                treeSitter,
                treeSitterFormatter,
            ),
        ),
        languages.registerDocumentFormattingEditProvider(
            "snippet",
            provideDocumentFormattingEditsForText(snippetFormatter),
        ),
    );
}
