import * as vscode from "vscode";
import { CommandServerExtension } from "../typings/commandServer";
import { getSortedSelections } from "../util/getSortedSelections";
import { ParseTreeExtension } from "../typings/parserTree";

export class GetText {
    constructor(
        private commandServerExtension: CommandServerExtension,
        private parseTreeExtension: ParseTreeExtension
    ) {}

    getDocumentText(): string | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return null;
        }

        return editor.document.getText();
    }

    getSelectedText(): string[] | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor || !this.inTextEditor()) {
            return null;
        }

        return getSortedSelections(editor).map((selection) => editor.document.getText(selection));
    }

    getDictationContext(): { before: string; after: string } | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor || editor.selections.length !== 1 || !this.inTextEditor()) {
            return null;
        }

        const startLine = editor.document.lineAt(editor.selection.start);
        const endLine = editor.document.lineAt(editor.selection.end);
        const startChar = editor.selection.start.character;
        const endChar = editor.selection.end.character;

        return {
            before: startLine.text.slice(startChar - 2, startChar),
            after: endLine.text.slice(endChar, endChar + 2)
        };
    }

    getClassName(): string | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor || !this.inTextEditor()) {
            return null;
        }

        try {
            const pos = editor.selection.active;
            const location = new vscode.Location(editor.document.uri, pos);
            let node = this.parseTreeExtension.getNodeAtLocation(location);
            while (node.parent != null) {
                if (node.type === "class_declaration" || node.type === "enum_declaration") {
                    return node.childForFieldName("name")?.text ?? null;
                }
                node = node.parent;
            }
        } catch (error) {
            console.log(error);
        }

        return null;
    }

    private inTextEditor(): boolean {
        return this.commandServerExtension.getFocusedElementType() === "textEditor";
    }
}
