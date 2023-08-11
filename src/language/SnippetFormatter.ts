import type { LanguageFormatterText } from "./registerLanguageFormatter";

export class SnippetFormatter implements LanguageFormatterText {
    private eol = "";

    getText(ident: string, eol: string, text: string): string {
        this.eol = eol;

        const sections = text.split(/^---$/m);
        return (
            sections
                .map((s) => this.getSectionText(s))
                .join("---")
                .trim() + eol
        );
    }

    private getSectionText(text: string): string {
        const parts = text.split(/^-$/m);
        parts[0] = this.getContextText(parts[0]);
        return parts.join("-");
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
