import * as assert from "assert";
import * as vscode from "vscode";
import {
    numbersToPlainSelections,
    numbersToSelections,
    selectionsToPlainSelections,
} from "./testUtil/selectionUtil";

export interface Test {
    title: string;
    language?: string;
    command: {
        id: string;
        args?: any[];
    };
    pre: {
        content: string;
        selections?: number[][];
    };
    post: {
        content?: string;
        selections?: number[][];
    };
}

export const runTest = (testConfig: Test) => {
    test(testConfig.title, async () => {
        const editor = await openEditorForTest(testConfig);

        await runCommand(testConfig);

        evaluatePost(testConfig, editor);
    });
};

function evaluatePost(testConfig: Test, editor: vscode.TextEditor) {
    const { content, selections } = testConfig.post;

    if (content != null) {
        assert.equal(editor.document.getText(), content);
    }

    if (selections != null) {
        assert.deepEqual(
            selectionsToPlainSelections(editor.selections),
            numbersToPlainSelections(selections)
        );
    }
}

function runCommand(testConfig: Test) {
    const { id, args } = testConfig.command;

    const fullId = `andreas.${id}`;

    return vscode.commands.executeCommand(fullId, ...(args ?? []));
}

async function openEditorForTest(testConfig: Test) {
    const {
        language,
        pre: { content, selections },
    } = testConfig;

    const editor = await openNewEditor(content, testConfig.language);

    if (selections != null) {
        editor.selections = numbersToSelections(selections);
    }

    return editor;
}

async function openNewEditor(content: string, language: string = "plaintext") {
    // await vscode.commands.executeCommand("workbench.action.closeAllEditors");

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
