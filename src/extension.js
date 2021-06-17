const vscode = require("vscode");
const selectTo = require("./select-to");
const lineMiddle = require("./line-middle");
const formatDocument = require("./format-document");
const jump = require("./jump/jump");

const activate = (context) => {
    jump.init();

    context.subscriptions.push(
        vscode.commands.registerCommand("andreas.selectTo", selectTo),
        vscode.commands.registerCommand("andreas.lineMiddle", lineMiddle),
        vscode.commands.registerCommand("andreas.formatDocument", formatDocument),

        vscode.commands.registerCommand("andreas.jumpSearch", jump.search),
        vscode.commands.registerCommand("andreas.jumpCancel", jump.cancel),
        vscode.commands.registerCommand("andreas.jumpAction", jump.action)
    );
};

const deactivate = () => { };

module.exports = { activate, deactivate };