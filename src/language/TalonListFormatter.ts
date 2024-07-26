import { configuration } from "../util/configuration";
import type { LanguageFormatterText } from "./registerLanguageFormatters";
import { parseTalonList } from "./TalonListParser";

export const talonListFormatter: LanguageFormatterText = {
    getText(text: string, _ident: string): string {
        const columnWidth = getColumnWidth(text);
        const talonList = parseTalonList(text);
        talonList.headers.sort((a, b) => (a.type === "header" && a.key === "list" ? -1 : 0));
        const result: string[] = [];

        for (const header of talonList.headers) {
            if (header.type === "comment") {
                result.push(header.text);
                continue;
            }
            result.push(`${header.key}: ${header.value}`);
        }

        result.push("-", "");

        for (const item of talonList.items) {
            if (item.type === "empty") {
                result.push("");
                continue;
            }
            if (item.type === "comment") {
                result.push(item.text);
                continue;
            }
            if (item.value != null) {
                const keyWithColon =
                    columnWidth != null ? `${item.key}: `.padEnd(columnWidth) : `${item.key}: `;
                result.push(`${keyWithColon}${item.value}`);
            } else {
                result.push(item.key);
            }
        }

        result.push("");

        return result.join("\n");
    }
};

function getColumnWidth(text: string) {
    const match = text.match(/# fmt: columnWidth=(\d+)/);
    if (match != null) {
        return parseInt(match[1]);
    }
    return configuration.talonListFormatter.columnWidth();
}
