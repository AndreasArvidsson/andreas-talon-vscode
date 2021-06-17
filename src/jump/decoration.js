const vscode = require("vscode");

let fontFamily, fontSize, height, type;

const init = () => {
    type = vscode.window.createTextEditorDecorationType({});
    const config = vscode.workspace.getConfiguration("editor");
    fontFamily = config.get("fontFamily");
    fontSize = config.get("fontSize");
    height = fontSize - 1;
};

const create = (lineIndex, charIndex, text, offset = false) =>
    createInner(lineIndex, charIndex, text, offset);

const createOffset = (lineIndex, charIndex, text) =>
    createInner(lineIndex, charIndex, text, true);

const createInner = (lineIndex, charIndex, text, offset) => {
    const width = fontSize * text.length / 2 + 3 * text.length;
    return {
        range: new vscode.Range(lineIndex, charIndex, lineIndex, charIndex + text.length),
        renderOptions: {
            light: { after: { contentIconPath: createSvg(text, width, height, false, offset) } },
            dark: { after: { contentIconPath: createSvg(text, width, height, true, offset) } },
            after: {
                margin: `${offset ? -height : 0}px 0 0 ${-width + 2}px`,
                width: `${width - 2}px`,
                height: `${height}px`
            }
        }
    };
};

module.exports = {
    init, create, createOffset,
    getType: () => type
};


// const createSvg = (text, width, height, isDark) => {
//     const bgColor = isDark ? "white" : "black";
//     const color = isDark ? "black" : "white";
//     let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">`;
//     svg += `<rect width="${width}" height="${height}" rx="2" ry="2" style="fill: ${bgColor};"></rect>`;
//     svg += `<text font-family="${fontFamily}" font-size="${fontSize}px" textLength="${width - 2}" textAdjust="spacing" fill="${color}" x="1" y="${height - 2}" alignment-baseline="baseline">`;
//     svg += text;
//     svg += "</text></svg>";
//     return vscode.Uri.parse(`data:image/svg+xml;utf8,${svg}`);
// };

const createSvg = (text, width, height, isDark, offset) => {
    const bgColor = isDark ? "white" : "black";
    const color = isDark ? "black" : "white";
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height * (offset ? 2 : 1)}">`;
    svg += `<rect width="${width}" height="${height}" rx="2" ry="2" style="fill: ${bgColor};"></rect>`;
    svg += `<text font-family="${fontFamily}" font-size="${fontSize}px" textLength="${width - 2}" textAdjust="spacing" fill="${color}" x="1" y="${height - 2}" alignment-baseline="baseline">`;
    svg += text;
    svg += "</text></svg>";
    return vscode.Uri.parse(`data:image/svg+xml;utf8,${svg}`);
};