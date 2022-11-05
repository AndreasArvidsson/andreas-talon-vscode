import * as vscode from "vscode";

interface Options {
    language: string;
    content: string;
}

export default async function openNewEditor(options: Options) {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");

    const document = await vscode.workspace.openTextDocument(options);

    const editor = await vscode.window.showTextDocument(document);

    const eol = options.content.includes("\r\n")
        ? vscode.EndOfLine.CRLF
        : vscode.EndOfLine.LF;
    if (eol !== editor.document.eol) {
        await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
    }

    return editor;
}
