import * as vscode from "vscode";

export default async function openNewEditor(
    language: string = "plaintext",
    content?: string
) {
    await vscode.commands.executeCommand("workbench.action.closeAllEditors");

    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });

    const editor = await vscode.window.showTextDocument(document);

    const eol = content?.includes("\r\n")
        ? vscode.EndOfLine.CRLF
        : vscode.EndOfLine.LF;
    if (eol !== editor.document.eol) {
        await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
    }

    return editor;
}
