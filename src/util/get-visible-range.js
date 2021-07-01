const vscode = require("vscode");

module.exports = () => {
    let startLine, startCharacter, endLine, endCharacter;
    startLine = startCharacter = Number.MAX_SAFE_INTEGER;
    endLine = endCharacter = 0;
    vscode.window.activeTextEditor.visibleRanges.forEach(r => {
        startLine = Math.min(startLine, r.start.line);
        endLine = Math.max(endLine, r.end.line);
        startCharacter = Math.min(startCharacter, r.start.character);
        endCharacter = Math.max(endCharacter, r.end.character);
    });
    return new vscode.Range(startLine, startCharacter, endLine, endCharacter);
};