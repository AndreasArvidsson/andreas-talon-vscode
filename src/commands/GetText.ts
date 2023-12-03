import * as vscode from "vscode";
import type { QueryMatch, TreeSitter } from "../treeSitter/TreeSitter";
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
        const classNode = findsSmallestContainingPosition(result, "class", editor.selection.active);

        if (classNode == null) {
            return null;
        }

        const nameNode = findsSmallestInRange(result, "class.name", classNode.range);

        return nameNode?.node.text ?? null;
    }

    getOpenTagName(): string | null {
        const editor = vscode.window.activeTextEditor;

        if (!editor || !this.inTextEditor()) {
            return null;
        }

        const result = this.treeSitter.parse(editor.document);
        const element = findsSmallestContainingPosition(result, "element", editor.selection.active);

        if (element == null) {
            return null;
        }

        const startTagName = findsSmallestInRange(result, "startTag.name", element.range);
        const endTagName = findsSmallestInRange(result, "endTag.name", element.range);
        const startName = startTagName?.node.text;
        const endName = endTagName?.node.text;

        if (startName == null || startName === endName) {
            return null;
        }

        return startName;
    }

    private inTextEditor(): boolean {
        return this.commandServerExtension.getFocusedElementType() === "textEditor";
    }
}

function findsSmallestContainingPosition(
    matches: QueryMatch[],
    name: string,
    position: vscode.Position
): QueryMatch | undefined {
    const filtered = matches.filter((match) => {
        return match.name === name && match.range.contains(position);
    });

    if (filtered.length === 0) {
        return undefined;
    }

    sortSmallest(filtered);

    return filtered[0];
}

function findsSmallestInRange(
    matches: QueryMatch[],
    name: string,
    range: vscode.Range
): QueryMatch | undefined {
    const filtered = matches.filter((match) => {
        return match.name === name && range.contains(match.range);
    });

    if (filtered.length === 0) {
        return undefined;
    }

    sortSmallest(filtered);

    return filtered[0];
}

function sortSmallest(matches: QueryMatch[]) {
    matches.sort((a, b) => {
        if (a.range.contains(b.range)) {
            return 1;
        }
        if (b.range.contains(a.range)) {
            return -1;
        }
        return 0;
    });
}
