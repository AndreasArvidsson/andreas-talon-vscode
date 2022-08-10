import {
    EndOfLine,
    languages,
    Range,
    TextDocument,
    TextEdit,
    TextEditor,
    window,
} from "vscode";

const columnWidth = 28;

function provideDocumentFormattingEditsTalon(
    document: TextDocument
): TextEdit[] {
    const editor = window.activeTextEditor!;
    const editorIndentation = getIndentation(editor);
    const lines = getLines(editor);
    const startOfBodyLine = lines.findIndex((line) => line.startsWith("-"));
    const result: string[] = [];
    let trailingEmptyLine = false;

    lines.forEach((line, index) => {
        const isIndented = line.startsWith(" ") || line.startsWith("\t");

        line = line.trim();
        trailingEmptyLine = !line;

        // Empty line
        if (trailingEmptyLine) {
            result.push("");
            return;
        }

        // Header divider
        if (line.startsWith("-")) {
            result.push(line);
            return;
        }

        // Lines are either totaly left or one tab in
        const indent = isIndented ? editorIndentation : "";

        // Commented or indented lines are not modified
        if (line.startsWith("#") || isIndented) {
            result.push(indent + line);
            return;
        }

        const colonIndex = getColonIndex(line);

        // Without a colon. Probably a multiline body.
        if (colonIndex < 0) {
            result.push(indent + line);
            return;
        }

        const left = indent + line.slice(0, colonIndex).trim();
        const right = line.slice(colonIndex + 1).trim();
        const isHeader = index < startOfBodyLine;
        const isTag = line.startsWith("tag()");

        // Without a right hand side. Probably rule for a multiline command.
        if (!right) {
            result.push(left + ":");
            return;
        }

        // Command that should NOT have padding
        if (isHeader || isTag) {
            result.push(left + ": " + right);
            return;
        }

        // Command that should have whitespace padding between left and right
        result.push((left + ": ").padEnd(columnWidth) + right);
    });

    // Document ends with an empty line
    if (!trailingEmptyLine) {
        result.push("");
    }

    const originalText = editor.document.getText();
    const newText = result.join(getEOL(editor));

    if (originalText === newText) {
        return [];
    }

    return [
        TextEdit.replace(
            new Range(
                editor.document.lineAt(0).range.start,
                editor.document.lineAt(editor.document.lineCount - 1).range.end
            ),
            newText
        ),
    ];
}

function getLines(editor: TextEditor): string[] {
    const lines: string[] = [];
    for (let i = 0; i < editor.document.lineCount; ++i) {
        lines.push(editor.document.lineAt(i).text);
    }
    return removeTrailingEmptyLines(lines);
}

function removeTrailingEmptyLines(lines: string[]): string[] {
    let i = lines.length - 1;
    for (; i > -1; --i) {
        if (lines[i].trim()) {
            break;
        }
    }
    return lines.slice(0, i + 1);
}

// Find the colon separating commands and their implementation
const getColonIndex = (line: string): number => {
    const parts = line.matchAll(/[():]/g);
    let inParen = false;
    for (const m of parts) {
        const char = m[0];
        switch (m[0]) {
            case "(":
                inParen = true;
                break;
            case ")":
                inParen = false;
                break;
            case ":":
                if (!inParen && m.index != null) {
                    return m.index;
                }
        }
    }
    return -1;
};

function getIndentation(editor: TextEditor): string {
    return new Array(editor.options.tabSize ?? 4)
        .fill(editor.options.insertSpaces ? " " : "\t")
        .join("");
}

function getEOL(editor: TextEditor): string {
    return editor.document.eol === EndOfLine.LF ? "\n" : "\r\n";
}

export function registerLanguageFormatter() {
    return languages.registerDocumentFormattingEditProvider(
        { language: "talon" },
        {
            provideDocumentFormattingEdits: provideDocumentFormattingEditsTalon,
        }
    );
}
