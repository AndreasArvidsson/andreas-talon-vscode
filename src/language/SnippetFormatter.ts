import { SnippetDocument, SnippetVariable, parseSnippetFile } from "./SnippetParser";
import type { LanguageFormatterText } from "./registerLanguageFormatters";

export const snippetFormatter: LanguageFormatterText = {
    getText(ident: string, text: string): string {
        const formatter = new SnippetFormatter(ident);
        return formatter.getText(text);
    }
};

class SnippetFormatter {
    constructor(private ident: string) {}

    getText(text: string): string {
        const result = parseSnippetFile(text)
            .map((s) => this.getDocumentText(s))
            // Remove empty documents
            .filter(Boolean)
            .join("\n---\n\n");
        return result ? result + "\n---\n" : "";
    }

    private getDocumentText(document: SnippetDocument): string {
        const parts: string[] = [
            this.getOptionalPairString("name", document.name),
            this.getOptionalPairString("language", document.languages),
            this.getOptionalPairString("phrase", document.phrases),
            this.getOptionalPairString("insertionScope", document.insertionScopes)
        ].filter(Boolean);

        if (document.variables.length > 0) {
            if (parts.length > 0) {
                parts.push("");
            }
            parts.push(...this.getSortedVariables(document.variables));
        }

        if (document.body != null) {
            parts.push("-", ...document.body);
        }

        return parts.join("\n");
    }

    private getSortedVariables(variables: SnippetVariable[]): string[] {
        const result = [...variables];
        result.sort(compareVariables);
        return result
            .flatMap((variable) => [
                this.getOptionalPairString(
                    `$${variable.name}.insertionFormatter`,
                    variable.insertionFormatters
                ),
                this.getOptionalPairString(
                    `$${variable.name}.wrapperPhrase`,
                    variable.wrapperPhrases
                ),
                this.getOptionalPairString(`$${variable.name}.wrapperScope`, variable.wrapperScope)
            ])
            .filter(Boolean);
    }

    private getOptionalPairString(key: string, value: string | string[] | undefined): string {
        if (value == null) {
            return "";
        }
        if (Array.isArray(value)) {
            return `${key}: ${value.join(" | ")}`;
        }
        return `${key}: ${value}`;
    }
}

function compareVariables(a: SnippetVariable, b: SnippetVariable): number {
    if (a.name === "0") {
        return 1;
    }
    if (b.name === "0") {
        return -1;
    }
    return a.name.localeCompare(b.name);
}
