import {
    snippetFormatter,
    talonFormatter,
    talonListFormatter,
    treeSitterFormatter,
    type Options,
    type SyntaxNode,
} from "@cursorless/talon-tools";
import type { FormattingOptions, TextDocument } from "vscode";
import { Disposable, languages, Range, TextEdit } from "vscode";
import type { TreeSitter } from "../treeSitter/TreeSitter";
import { getErrorMessage } from "../util/getErrorMessage";
import { getFormattingOptions } from "../util/getFormattingOptions";

type LanguageFormatterTree = (node: SyntaxNode, options: Options) => string;
type LanguageFormatterText = (text: string, options: Options) => string;

function provideDocumentFormattingEditsForTree(
    treeSitter: TreeSitter,
    formatter: LanguageFormatterTree,
) {
    return {
        provideDocumentFormattingEdits: async (
            document: TextDocument,
            formattingOptions: FormattingOptions,
        ): Promise<TextEdit[]> => {
            try {
                const options = await getFormattingOptions(
                    document,
                    formattingOptions,
                );
                const rootNode = treeSitter.getRootNode(document);

                if (rootNode.hasError) {
                    console.warn(
                        `Abort document formatting: Syntax tree has error`,
                    );
                    return [];
                }

                const originalText = document.getText();
                const updatedText = formatter(rootNode, options);
                return createTextEdits(document, originalText, updatedText);
            } catch (error) {
                console.warn(getErrorMessage(error));
                return [];
            }
        },
    };
}

function provideDocumentFormattingEditsForText(
    formatter: LanguageFormatterText,
) {
    return {
        provideDocumentFormattingEdits: async (
            document: TextDocument,
            formattingOptions: FormattingOptions,
        ): Promise<TextEdit[]> => {
            try {
                const options = await getFormattingOptions(
                    document,
                    formattingOptions,
                );
                const originalText = document.getText();
                const updatedText = formatter(originalText, options);
                return createTextEdits(document, originalText, updatedText);
            } catch (error) {
                console.warn(getErrorMessage(error));
                return [];
            }
        },
    };
}

function createTextEdits(
    document: TextDocument,
    originalText: string,
    updatedText: string,
): TextEdit[] {
    if (originalText === updatedText) {
        return [];
    }
    return [
        TextEdit.replace(
            new Range(
                document.lineAt(0).range.start,
                document.lineAt(document.lineCount - 1).range.end,
            ),
            updatedText,
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
