import * as assert from "assert";
import * as vscode from "vscode";
import getFullCommand from "../util/getFullCommand";
import openNewEditor from "./testUtil/openNewEditor";
import {
    numbersToPlainSelections,
    numbersToSelections,
    selectionsToPlainSelections,
} from "./testUtil/selectionUtil";
import { TestFixture } from "./testUtil/test.types";

export const runTest = (testConfig: TestFixture) => {
    test(testConfig.title, async () => {
        const editor = await openEditor(testConfig);

        await runCommand(testConfig);

        evaluatePost(testConfig, editor);
    });
};

async function openEditor(fixture: TestFixture) {
    const {
        language,
        pre: { content, selections },
    } = fixture;

    const editor = await openNewEditor(content, fixture.language);

    if (selections != null) {
        editor.selections = numbersToSelections(selections);
    }

    return editor;
}

function evaluatePost(fixture: TestFixture, editor: vscode.TextEditor) {
    const { content, selections } = fixture.post;

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

function runCommand(fixture: TestFixture) {
    const { id, args } = fixture.command;

    return vscode.commands.executeCommand(getFullCommand(id), ...(args ?? []));
}
