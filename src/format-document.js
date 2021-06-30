const vscode = require("vscode");
const applyEdit = require("./util/apply-edit");

module.exports = () => {
    const editor = vscode.window.activeTextEditor;
    const lines = [];
    let toDo = [];
    let bodyIndex = 0;
    let length = 0;
    for (let i = 0; i < editor.document.lineCount; ++i) {
        let line = editor.document.lineAt(i).text;

        //  Lines are either totaly left or one tab in
        if (line.startsWith(" ") || line.startsWith("\t")) {
            line = "    " + line.trim();
        }
        else {
            line = line.trim();
        }
        lines[i] = line;

        //  Ignore comments, indented lines or tags
        if (line.startsWith("#")
            || line.startsWith(" ")
            || line.startsWith("tag()")) {
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
        const index = line.indexOf(":");
        if (index < 0 || index == line.length - 1) {
            continue;
        }

        const left = line.slice(0, index).trim();
        const right = line.slice(index + 1).trim();
        length = Math.max(length, left.length)
        toDo.push({ i, left, right });
    }

    // Add a little space betwee left and right
    length += 4;
    for (const l of toDo) {
        let left = l.left + ":";
        left = left.padEnd(length);
        lines[l.i] = left + l.right;
    }

    const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
    const lastPos = lastLine.range.end;

    applyEdit(vscode.TextEdit.replace(
        new vscode.Range(0, 0, lastPos.line, lastPos.character),
        lines.join("\n")
    ));
};