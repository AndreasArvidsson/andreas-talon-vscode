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

        const returnValue = await runCommand(testConfig);

        evaluatePost(testConfig, editor, returnValue);
    });
};

async function openEditor(fixture: TestFixture) {
    const {
        language,
        pre: { content, selections },
    } = fixture;

    const editor = await openNewEditor(language, content);

    if (selections != null) {
        editor.selections = numbersToSelections(selections);
    }

    return editor;
}

function evaluatePost(
    fixture: TestFixture,
    editor: vscode.TextEditor,
    actualReturnValue: unknown
) {
    const { content, selections, returnValue } = fixture.post;

    if (content != null) {
        assert.equal(editor.document.getText(), content, "Content");
    }

    if (selections != null) {
        assert.deepEqual(
            selectionsToPlainSelections(editor.selections),
            numbersToPlainSelections(selections),
            "Selections"
        );
    }

    if (returnValue != null) {
        assert.deepEqual(actualReturnValue, returnValue, "Return value");
    }
}

function runCommand(fixture: TestFixture) {
    const { id, args } = fixture.command;

    return vscode.commands.executeCommand(getFullCommand(id), ...(args ?? []));
}
