const vscode = require("vscode");
const getVisibleRange = require("./util/get-visible-range");

module.exports = {
    upHalfPage: () => scrollHalfPage(-1),
    downHalfPage: () => scrollHalfPage(1)
};

const scrollHalfPage = (mult) => {
    const editor = vscode.window.activeTextEditor;
    visibleRange = getVisibleRange();
    const halfSize = (visibleRange.end.line - visibleRange.start.line) / 2;
    const startLine = clamp(
        Math.round(visibleRange.start.line + halfSize * mult),
        0,
        editor.document.lineCount - 1
    );
    const newRange = new vscode.Range(
        startLine, 0, startLine, 0
    );
    editor.revealRange(newRange, vscode.TextEditorRevealType.AtTop);
}

const clamp = (value, min, max) =>
    value < min ? min : value > max ? max : value;