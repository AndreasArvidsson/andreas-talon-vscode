const vscode = require("vscode");
const selectTo = require("./select-to");
const lineMiddle = require("./line-middle");
const formatDocument = require("./format-document");

const activate = (context) => {
    context.subscriptions.push(
        vscode.commands.registerCommand("andreas.selectTo", selectTo),
        vscode.commands.registerCommand("andreas.lineMiddle", lineMiddle),
        vscode.commands.registerCommand("andreas.formatDocument", formatDocument)
    );
};

const deactivate = () => { };

module.exports = { activate, deactivate };