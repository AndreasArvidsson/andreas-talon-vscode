import { commands, EndOfLine, TextEditor, window, workspace } from "vscode";

interface Options {
    language: string;
    content: string;
}

export default async function openNewEditor(
    options: Options
): Promise<TextEditor> {
    await commands.executeCommand("workbench.action.closeAllEditors");

    const document = await workspace.openTextDocument(options);

    const editor = await window.showTextDocument(document);

    const eol = options.content.includes("\r\n")
        ? EndOfLine.CRLF
        : EndOfLine.LF;
    if (eol !== editor.document.eol) {
        await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
    }

    return editor;
}
