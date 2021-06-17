const vscode = require("vscode");

module.exports = (edit) => {
    const workEdit = new vscode.WorkspaceEdit();
    workEdit.set(vscode.window.activeTextEditor.document.uri, [edit]);
    vscode.workspace.applyEdit(workEdit);
};