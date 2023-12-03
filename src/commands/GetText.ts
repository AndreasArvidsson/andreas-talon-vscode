import * as vscode from "vscode";
import type { Scope, TreeSitter } from "../treeSitter/TreeSitter";
import type { CommandServerExtension } from "../typings/commandServer";
import { getSortedSelections } from "../util/getSortedSelections";

export class GetText {
    constructor(
        private commandServerExtension: CommandServerExtension,
        private treeSitter: TreeSitter
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

        const result = this.treeSitter.parse(editor.document);
        const nameNode = findsSmallestContainingPosition(
            result,
            "class.name",
            editor.selection.active
        );

        return nameNode?.node.text ?? null;
    }

    getOpenTagName(): string | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor || !this.inTextEditor()) {
            return null;
        }

        const scopes = this.treeSitter.parse(editor.document);
        const nameNode = findsSmallestContainingPosition(
            scopes,
            "startTag.name",
            editor.selection.active
        );

        return nameNode?.node.text ?? null;
    }

    private inTextEditor(): boolean {
        return this.commandServerExtension.getFocusedElementType() === "textEditor";
    }
}

function findsSmallestContainingPosition(
    scopes: Scope[],
    name: string,
    position: vscode.Position
): Scope | undefined {
    let smallest: Scope | undefined = undefined;

    for (const scope of scopes) {
        if (scope.name === name && scope.domain.contains(position)) {
            if (smallest == null || smallest.domain.contains(scope.domain)) {
                smallest = scope;
            }
        }
    }

    return smallest;
}
