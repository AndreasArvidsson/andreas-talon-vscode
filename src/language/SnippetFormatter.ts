import { parseSnippetFile, serializeSnippetFile } from "talon-snippets";
import type { TextDocument } from "vscode";
import type { LanguageFormatterText } from "./registerLanguageFormatters";

export const snippetFormatter: LanguageFormatterText = {
    getText(document: TextDocument, _indentation: string): string {
        const text = document.getText();
        const documents = parseSnippetFile(text);
        return serializeSnippetFile(documents);
    }
};
