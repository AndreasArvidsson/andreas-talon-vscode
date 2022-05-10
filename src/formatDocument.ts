import { window, Range } from "vscode";

export default () => {
    const editor = window.activeTextEditor!;
    const lines: string[] = [];
    let toDo = [];
    let bodyIndex = 0;
    let length = 0;

    for (let i = 0; i < editor.document.lineCount; ++i) {
        let line = editor.document.lineAt(i).text;

        // Make sure a line doesn't contain just white spaces
        if (!line.trim()) {
            line = "";
        }
        // Lines are either totaly left or one tab in
        else if (line.startsWith(" ") || line.startsWith("\t")) {
            line = "    " + line.trim();
        } else {
            line = line.trim();
        }
        lines[i] = line;

        // Ignore comments, indented lines or tags
        if (
            line.startsWith("#") ||
            line.startsWith(" ") ||
            line.startsWith("tag()")
        ) {
            continue;
        }

        // Start of body, ignore all above
        if (line.startsWith("-")) {
            bodyIndex = i + 1;
            length = 0;
            toDo = [];
            continue;
        }

        // Ignore lines without 2 parts
        const index = line.lastIndexOf(":");
        if (index < 0 || index === line.length - 1) {
            continue;
        }

        const left = line.slice(0, index).trim();
        const right = line.slice(index + 1).trim();
        length = Math.max(length, left.length);
        toDo.push({ i, left, right });
    }

    // Add a little space betwee left and right
    length += 4;
    for (const l of toDo) {
        let left = l.left + ":";
        left = left.padEnd(length);
        lines[l.i] = left + l.right;
    }

    const originalText = editor.document.getText();
    const newText = lines.join("\r\n");

    if (originalText === newText) {
        return;
    }

    const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
    const lastPos = lastLine.range.end;

    editor.edit((editBuilder) => {
        editBuilder.replace(
            new Range(0, 0, lastPos.line, lastPos.character),
            newText
        );
    });
};
