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
        parts[0] = this.getContextText(parts[0]);
        return parts.map((p) => p.trim()).join(`${this.eol}-${this.eol}`);
    }

    private getContextText(text: string): string {
        return (
            text
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
            return `${parts[0].trim()}: ${parts[1].trim()}`;
        }
        return text;
    }
}
