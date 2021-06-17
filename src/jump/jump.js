const vscode = require("vscode");
const decoration = require("./decoration");
const indexesOf = require("./indexes-of");
const getKeys = require("./get-keys");
const splitWords = require("./split-words");
const getRange = require("./get-range");
const applyEdit = require("../util/apply-edit");

let keys, map, currentEditor, timeout, searchPattern;

const init = () => {
    decoration.init();
    keys = getKeys();
    map = {};

    vscode.workspace.onDidChangeTextDocument(onChange);
    vscode.window.onDidChangeTextEditorVisibleRanges(onChange);
    vscode.window.onDidChangeActiveTextEditor(onChange);
    vscode.window.onDidChangeVisibleTextEditors(onChange);

    let currentLine;
    vscode.window.onDidChangeTextEditorSelection(e => {
        if (searchPattern || e.textEditor.selection.active.line !== currentLine) {
            currentLine = e.textEditor.selection.active.line;
            searchPattern = null;
            onChange();
        }
    });
};

const onChange = () => {
    clearTimeout(timeout);
    timeout = setTimeout(update, 50);
};

const search = (pattern) => {
    if (pattern.trim()) {
        searchPattern = pattern;
        update();
    }
};

const action = (action, key, value) => {
    searchPattern = null;
    const p = map[key];
    const editor = vscode.window.activeTextEditor;
    if (!p || currentEditor !== editor) {
        return;
    }
    if (action === "go") {
        action = isAfter(p) ? "before" : "after";
    }
    switch (action) {
        case "before":
            editor.selection = new vscode.Selection(
                p.line, p.start, p.line, p.start
            );
            break;
        case "after":
            editor.selection = new vscode.Selection(
                p.line, p.end, p.line, p.end
            );
            break;
        case "select":
            editor.selection = new vscode.Selection(
                p.line, p.start, p.line, p.end
            );
            break;
        case "extend":
            extendPosition(p);
            break;
        case "copy":
            copyPosition(p);
            break;
        case "delete":
            deletePosition(p);
            break;
        case "insert":
            insertPosition(p, value);
            break;
        case "replace":
            replacePosition(p, value);
            break;
        default:
            console.error(`Unknown action: '${action}'`);
    }
    update();
};

const cancel = () => {
    searchPattern = null;
    update();
};

module.exports = { init, search, cancel, action };

const extendPosition = (p) => {
    const editor = vscode.window.activeTextEditor;
    const a = editor.selection.active;
    const end = isAfter(p) ? p.start : p.end;
    editor.selection = new vscode.Selection(
        a.line, a.character, p.line, end
    );
};

const copyPosition = async (p) => {
    const text = getText(p);
    await vscode.env.clipboard.writeText(text);
};

const deletePosition = (p) => {
    const { first, last, before, after } = hasBlank(p.line, p.start, p.end);
    const start = p.start - (last && before ? 1 : 0);
    const end = p.end + (first && after || before && after ? 1 : 0);
    applyEdit(vscode.TextEdit.delete(
        new vscode.Range(p.line, start, p.line, end)
    ));
};

const insertPosition = (p, value) => {
    const { first, before } = hasBlank(p.line, p.start, p.end);
    const padding = !first && !before ? " " : "";
    applyEdit(vscode.TextEdit.insert(
        new vscode.Position(p.line, p.start),
        padding + value + " "
    ));
};

const replacePosition = (p, value) => {
    const text = getText(p);
    if (isUpper(text)) {
        value = upper(value);
    }
    else if (isCapitalized(text)) {
        value = capitalize(value);
    }
    applyEdit(vscode.TextEdit.replace(
        new vscode.Range(p.line, p.start, p.line, p.end),
        value
    ));
};

const update = () => {
    if (vscode.window.activeTextEditor.document.uri.scheme === "output") {
        updateDecorations([], false);
    }
    else if (searchPattern) {
        updateSearch();
    }
    else {
        updateLine();
    }
};

const updateLine = () => {
    const editor = vscode.window.activeTextEditor;
    const position = editor.selection.active;
    const text = editor.document.lineAt(position.line).text;
    const words = splitWords(text);
    const positions = getPositions(text, position.line, words);
    updateDecorations(positions, true);
};

const updateSearch = () => {
    const editor = vscode.window.activeTextEditor;
    const range = getRange();
    const positions = [];
    for (let line = range.start.line; line <= range.end.line; ++line) {
        const text = editor.document.lineAt(line).text.toLowerCase();
        const indexes = indexesOf(text, searchPattern);
        for (const start of indexes) {
            positions.push(
                getPosition(line, start, start + searchPattern.length)
            );
        }
    }
    updateDecorations(positions, false);
};

const updateDecorations = (positions, offset) => {
    map = {};
    const decorations = [];
    for (let i = 0; i < positions.length; ++i) {
        const key = keys[i];
        if (!key) { // Already used all unique keys
            break;
        }
        const position = positions[i];
        decorations.push(decoration.create(
            position.line, position.character, key, offset
        ));
        map[key.toLowerCase()] = position;
    }
    if (currentEditor && currentEditor !== vscode.window.activeTextEditor) {
        currentEditor.setDecorations(decoration.getType(), []);
    }
    currentEditor = vscode.window.activeTextEditor
    currentEditor.setDecorations(decoration.getType(), decorations);
};

const getPositions = (text, line, words) => {
    let start, end;
    start = end = 0;
    return words.map(word => {
        start = text.indexOf(word, end);
        end = start + word.length;
        return getPosition(line, start, end);
    });
};

const getPosition = (line, start, end) => ({
    line, start, end,
    character: Math.floor((start + end - 1) / 2)
});

const hasBlank = (line, start, end) => {
    const text = vscode.window.activeTextEditor.document.lineAt(line).text;
    return {
        first: start === 0,
        last: end === text.length,
        before: start > 0 && text[start - 1] === " ",
        after: end < text.length && text[end] === " "
    };
};

const isAfter = (p) => {
    const a = vscode.window.activeTextEditor.selection.active;
    return a.line < p.line || (a.line === p.line && a.character <= p.start);
};

const isUpper = (text) => text === text.toLocaleUpperCase();
const upper = (text) => text.toLocaleUpperCase();
const isCapitalized = (text) => text.charAt(0) === text.charAt(0).toLocaleUpperCase();
const capitalize = (text) => text.charAt(0).toLocaleUpperCase() + text.slice(1);
const getText = (p) => vscode.window.activeTextEditor.document.lineAt(p.line).text.slice(p.start, p.end);