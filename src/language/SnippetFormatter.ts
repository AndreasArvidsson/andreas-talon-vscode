import { SnippetDocument, SnippetVariable, parseSnippetFile } from "./SnippetParser";
import type { LanguageFormatterText } from "./registerLanguageFormatter";

export class SnippetFormatter implements LanguageFormatterText {
    private eol = "";

    getText(ident: string, eol: string, text: string): string {
        this.eol = eol;

        return (
            parseSnippetFile(text)
                .map((s) => this.getDocumentText(s))
                // Remove empty documents
                .filter(Boolean)
                .join(`${eol}---${eol}${eol}`) + `${eol}---${eol}`
        );
    }

    private getDocumentText(document: SnippetDocument): string {
        const parts: string[] = [
            this.getOptionalPairString("name", document.name),
            this.getOptionalPairString("language", document.language),
            this.getOptionalPairString("phrase", document.phrase)
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

        return parts.join(this.eol);
    }

    private getSortedVariables(variables: SnippetVariable[]): string[] {
        const result = [...variables];
        result.sort(compareVariables);
        return result
            .flatMap((variable) => [
                this.getOptionalPairString(
                    `$${variable.name}.wrapperPhrase`,
                    variable.wrapperPhrase
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
