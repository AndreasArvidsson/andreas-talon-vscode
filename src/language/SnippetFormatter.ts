import type { LanguageFormatterText } from "./registerLanguageFormatters";
import { parseSnippetFile, serializeSnippetFile } from "talon-snippets";

export const snippetFormatter: LanguageFormatterText = {
    getText(text: string, _ident: string): string {
        const documents = parseSnippetFile(text);
        return serializeSnippetFile(documents);
    }
};
