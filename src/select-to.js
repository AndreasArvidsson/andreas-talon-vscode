const vscode = require("vscode");

module.exports = (lineNumber) => {
    const editor = vscode.window.activeTextEditor;
    --lineNumber;
    const position = editor.selection.active;
    if (position.line === lineNumber) {
        return;
    }
    const character = lineNumber > position.line
        ? 1000 : 0;
    editor.selection = new vscode.Selection(
        position,
        new vscode.Position(lineNumber, character)
    );
};