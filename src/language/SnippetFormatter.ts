import { parseSnippetFile, serializeSnippetFile } from "talon-snippets";
import type { LanguageFormatterText } from "./registerLanguageFormatters";

export const snippetFormatter: LanguageFormatterText = {
    getText(text: string, _indentation: string): string {
        const documents = parseSnippetFile(text);
        return serializeSnippetFile(documents);
    },
};
