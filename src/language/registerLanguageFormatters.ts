import {
    snippetFormatter,
    talonFormatter,
    talonListFormatter,
    treeSitterFormatter,
    type Options,
    type SyntaxNode,
} from "@cursorless/talon-tools";
import type { FormattingOptions, TextDocument, ExtensionContext } from "vscode";
import { Disposable, languages, Range, TextEdit, ExtensionMode } from "vscode";
import type { TreeSitter } from "../treeSitter/TreeSitter";
import { getErrorMessage } from "../util/getErrorMessage";
import { getFormattingOptions } from "../util/getFormattingOptions";

type LanguageFormatterTree = (
    node: SyntaxNode,
    options: Options,
    debug: boolean,
) => string;
type LanguageFormatterText = (
    text: string,
    options: Options,
    debug: boolean,
) => string;

export function registerLanguageFormatters(
    context: ExtensionContext,
    treeSitter: TreeSitter,
): Disposable {
    const debug = context.extensionMode !== ExtensionMode.Production;

    const provideDocumentFormattingEditsForTree = (
        formatter: LanguageFormatterTree,
    ) => {
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
                    const updatedText = formatter(rootNode, options, debug);
                    return createTextEdits(document, originalText, updatedText);
                } catch (error) {
                    console.warn(getErrorMessage(error));
                    return [];
                }
            },
        };
    };

    const provideDocumentFormattingEditsForText = (
        formatter: LanguageFormatterText,
    ) => {
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
                    const updatedText = formatter(originalText, options, debug);
                    return createTextEdits(document, originalText, updatedText);
                } catch (error) {
                    console.warn(getErrorMessage(error));
                    return [];
                }
            },
        };
    };

    const createTextEdits = (
        document: TextDocument,
        originalText: string,
        updatedText: string,
    ): TextEdit[] => {
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
    };

    return Disposable.from(
        languages.registerDocumentFormattingEditProvider(
            "talon",
            provideDocumentFormattingEditsForTree(talonFormatter),
        ),
        languages.registerDocumentFormattingEditProvider(
            "talon-list",
            provideDocumentFormattingEditsForText(talonListFormatter),
        ),
        languages.registerDocumentFormattingEditProvider(
            "scm",
            provideDocumentFormattingEditsForTree(treeSitterFormatter),
        ),
        languages.registerDocumentFormattingEditProvider(
            "snippet",
            provideDocumentFormattingEditsForText(snippetFormatter),
        ),
    );
}
