import { commands, TextEditor, window, workspace, Uri } from "vscode";
import * as path from "path";
import * as fs from "fs";

export default async (name?: string): Promise<void> => {
    const editor = window.activeTextEditor;

    const fsPath =
        editor?.document?.uri.scheme === "file"
            ? editor.document.uri.fsPath
            : undefined;

    if (!fsPath) {
        await commands.executeCommand("explorer.newFile");
        return;
    }

    const dir = path.dirname(fsPath);
    const suggestedName = name || getSelectedText(editor);
    const suggestedExt = path.extname(suggestedName)
        ? ""
        : path.extname(fsPath);

    const filename = await window.showInputBox({
        prompt: "New name",
        value: `${suggestedName}${suggestedExt}`,
        valueSelection: [0, suggestedName.length],
        ignoreFocusOut: true,
    });

    if (!filename) {
        return;
    }

    const file = path.join(dir, filename);
    const uri = Uri.file(file);

    if (fs.existsSync(file)) {
        window.showErrorMessage(`File '${filename}' already exists`);
        return;
    }

    await workspace.fs.writeFile(uri, new Uint8Array());

    const document = await workspace.openTextDocument(uri);

    await window.showTextDocument(document);
};

function getSelectedText(editor?: TextEditor): string {
    if (editor?.selections.length !== 1) {
        return "";
    }
    const selectedText = editor.document.getText(editor.selection);
    if (/^[ \w\d-.]+$/.test(selectedText)) {
        return selectedText;
    }
    return "";
}
