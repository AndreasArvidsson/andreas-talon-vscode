import * as vscode from "vscode";

export default async function openNewEditor(
    content: string,
    language: string = "plaintext"
) {
    const document = await vscode.workspace.openTextDocument({
        language,
        content,
    });

    const editor = await vscode.window.showTextDocument(document);

    const eol = content.includes("\r\n")
        ? vscode.EndOfLine.CRLF
        : vscode.EndOfLine.LF;
    if (eol !== editor.document.eol) {
        await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
    }

    return editor;
}
