import { window, Range } from "vscode";

export default () => {
    let startLine = Number.MAX_SAFE_INTEGER;
    let endLine = 0;
    let startCharacter = Number.MAX_SAFE_INTEGER;
    let endCharacter = 0;
    window.activeTextEditor!.visibleRanges.forEach((r) => {
        startLine = Math.min(startLine, r.start.line);
        endLine = Math.max(endLine, r.end.line);
        startCharacter = Math.min(startCharacter, r.start.character);
        endCharacter = Math.max(endCharacter, r.end.character);
    });
    return new Range(startLine, startCharacter, endLine, endCharacter);
};
