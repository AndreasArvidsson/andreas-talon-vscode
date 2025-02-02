import * as prettier from "prettier";
import { Disposable, FormattingOptions, languages, Range, TextDocument, TextEdit } from "vscode";
import type { SyntaxNode } from "web-tree-sitter";
import { TreeSitter } from "../treeSitter/TreeSitter";
import { snippetFormatter } from "./SnippetFormatter";
import { talonFormatter } from "./TalonFormatter";
import { talonListFormatter } from "./TalonListFormatter";
import { treeSitterFormatter } from "./TreeSitterFormatter";

export interface LanguageFormatterTree {
    getText(node: SyntaxNode, ident: string): string;
}

export interface LanguageFormatterText {
    getText(text: string, ident: string): string;
}

function provideDocumentFormattingEditsForTree(
    treeSitter: TreeSitter,
    formatter: LanguageFormatterTree
) {
    return {
        provideDocumentFormattingEdits: async (
            document: TextDocument,
            options: FormattingOptions
        ): Promise<TextEdit[]> => {
            const rootNode = treeSitter.getRootNode(document);

            if (rootNode.hasError) {
                console.warn(`Abort document formatting: Syntax tree has error`);
                return [];
            }

            const { indentation } = await parseOptions(document, options);
            const newText = formatter.getText(rootNode, indentation);
            return createTextEdits(document, newText);
        }
    };
}

function provideDocumentFormattingEditsForText(formatter: LanguageFormatterText) {
    return {
        provideDocumentFormattingEdits: async (
            document: TextDocument,
            options: FormattingOptions
        ): Promise<TextEdit[]> => {
            const { indentation } = await parseOptions(document, options);
            try {
                const newText = formatter.getText(document.getText(), indentation);
                return createTextEdits(document, newText);
            } catch (error) {
                console.warn((error as Error).message);
                return [];
            }
        }
    };
}

async function parseOptions(document: TextDocument, options: FormattingOptions) {
    const config = await prettier.resolveConfig(document.uri.fsPath, {
        editorconfig: true
    });

    const insertSpaces = config != null ? !config.useTabs : options.insertSpaces;
    const tabSize = config?.tabWidth ?? options.tabSize;
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
