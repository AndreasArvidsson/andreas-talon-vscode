const vscode = require("vscode");
const getVisibleRange = require("./util/get-visible-range");

module.exports = {
    upHalfPage: () => scrollHalfPage(-1),
    downHalfPage: () => scrollHalfPage(1)
};

const scrollHalfPage = (mult) => {
    const editor  = vscode.window.activeTextEditor;
    range = getVisibleRange();
    pageSize = range.end.line - range.start.line;
    halfSize = pageSize / 2;
    const startLine = clamp(
        range.start.line + halfSize * mult,
        0,
        editor.document.lineCount - 1
    );
    const newRange = new vscode.Range(
        startLine,
        range.start.character,
        startLine + pageSize,
        range.end.character
    );
    editor.revealRange(newRange);
}

const clamp = (value, min, max) => 
    value < min ? min: value > max ? max : value;