interface TalonListHeader {
    type: "header";
    key: string;
    value: string;
}

interface TalonListItem {
    type: "item";
    key: string;
    value?: string;
}

interface EmptyLine {
    type: "empty";
}

interface CommentLine {
    type: "comment";
    text: string;
}

export interface TalonList {
    headers: (TalonListHeader | CommentLine)[];
    items: (TalonListItem | CommentLine | EmptyLine)[];
}

export function parseTalonList(text: string): TalonList {
    const separatorIndex = text.indexOf("-");

    if (separatorIndex === -1) {
        throw Error("Separator not found in talon list");
    }

    const headerLines = text
        .slice(0, separatorIndex)
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim());
    const bodyLines = text
        .slice(separatorIndex + 1)
        .trim()
        .split(/\r?\n/)
        .map((line) => line.trim());

    const result: TalonList = {
        headers: [],
        items: []
    };

    for (const line of headerLines) {
        if (line.length === 0) {
            continue;
        }
        if (line.startsWith("#")) {
            result.headers.push({ type: "comment", text: line });
            continue;
        }
        const [key, value] = splitLine(line);
        if (value === undefined) {
            throw Error("Header value missing");
        }
        result.headers.push({ type: "header", key, value });
    }

    for (const line of bodyLines) {
        if (line.length === 0) {
            result.items.push({ type: "empty" });
            continue;
        }
        if (line.startsWith("#")) {
            result.items.push({ type: "comment", text: line });
            continue;
        }
        const [key, value] = splitLine(line);
        result.items.push({ type: "item", key, value });
    }

    return result;
}

function splitLine(line: string): [string, string | undefined] {
    const index = line.indexOf(":");
    if (index === -1) {
        return [line, undefined];
    }
    return [line.substring(0, index).trimEnd(), line.substring(index + 1).trimStart()];
}
