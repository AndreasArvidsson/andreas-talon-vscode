import type { LanguageFormatterText } from "./registerLanguageFormatter";

export class SnippetFormatter implements LanguageFormatterText {
    private eol = "";

    getText(ident: string, eol: string, text: string): string {
        this.eol = eol;

        const documents = text.split(/^---$/m);
        return (
            documents
                .map((s) => this.getDocumentText(s))
                // Remove empty documents
                .filter(Boolean)
                .join(`${eol}---${eol}${eol}`)
                .trim() + eol
        );
    }

    private getDocumentText(text: string): string {
        const parts = text.split(/^-$/m);
        if (parts.length === 1) {
            return this.getContextText(parts[0]);
        }
        if (parts.length === 2) {
            const context = this.getContextText(parts[0]);
            const body = this.getBodyText(parts[1]);
            return `${context}${this.eol}-${this.eol}${body}`;
        }
        return text;
    }

    private getContextText(text: string): string {
        return (
            text
                .trim()
                .split(/\r?\n/)
                .map((l) => this.getContextLineText(l))
                .join(this.eol)
                // Limit to single empty line
                .replace(/(\r?\n){3,}/g, this.eol + this.eol)
        );
    }

    private getContextLineText(text: string): string {
        if (text.trim().length === 0) {
            return "";
        }
        const parts = text.split(":");
        if (parts.length === 2) {
            const value = parts[1]
                .split("|")
                .map((p) => p.trim())
                .join(" | ");
            return `${parts[0].trim()}: ${value}`;
        }
        return text;
    }

    private getBodyText(text: string): string {
        // Find first line that is not empty. Preserve indentation.
        const matchLeading = text.match(/^[ \t]*\S/m);
        if (matchLeading?.index == null) {
            return "";
        }
        return text
            .slice(matchLeading.index)
            .trimEnd()
            .split(/\r?\n/)
            .map((l) => l.trimEnd())
            .join(this.eol);
    }
}
