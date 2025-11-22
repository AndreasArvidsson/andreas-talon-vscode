import type { TextEditor } from "vscode";
import { commands, EndOfLine, window, workspace } from "vscode";
import { getParseTreeExtension } from "../../util/getExtension";

interface Options {
    language: string;
    content: string;
}

export default async function openNewEditor(
    options: Options,
): Promise<TextEditor> {
    await commands.executeCommand("workbench.action.closeAllEditors");

    const document = await workspace.openTextDocument(options);

    await (await getParseTreeExtension()).loadLanguage(options.language);

    const editor = await window.showTextDocument(document);

    const eol = options.content.includes("\r\n")
        ? EndOfLine.CRLF
        : EndOfLine.LF;
    if (eol !== editor.document.eol) {
        await editor.edit((editBuilder) => editBuilder.setEndOfLine(eol));
    }

    editor.options = { tabSize: 4, insertSpaces: true };

    return editor;
}
