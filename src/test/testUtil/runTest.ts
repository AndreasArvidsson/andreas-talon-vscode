import * as assert from "assert";
import * as vscode from "vscode";
import getFullCommand from "../../util/getFullCommand";
import { getFullFixture } from "./getFullFixture";
import openNewEditor from "./openNewEditor";
import {
    numbersToPlainSelections,
    numbersToSelections,
    selectionsToPlainSelections,
} from "./selectionUtil";
import { FullTestFixture, TestFixture } from "./test.types";

export const runTest = (fixture: TestFixture) => {
    test(fixture.title, async () => {
        const fullFixture = getFullFixture(fixture);

        const editor = await openEditor(fullFixture);

        const returnValue = await runCommand(fullFixture);

        assertPost(fullFixture, editor, returnValue);
    });
};

async function openEditor(fixture: FullTestFixture) {
    const { language, content, selections } = fixture.pre;

    const editor = await openNewEditor({ language, content });

    editor.selections = numbersToSelections(selections);

    return editor;
}

function assertPost(
    fixture: FullTestFixture,
    editor: vscode.TextEditor,
    actualReturnValue: unknown
) {
    const { language, content, selections, returnValue } = fixture.post;

    assert.equal(editor.document.languageId, language, "Language");
    assert.equal(editor.document.getText(), content, "Content");
    assert.deepEqual(actualReturnValue, returnValue, "Return value");

    assert.deepEqual(
        selectionsToPlainSelections(editor.selections),
        numbersToPlainSelections(selections),
        "Selections"
    );
}

function runCommand(fixture: FullTestFixture) {
    const { id, args } = fixture.command;

    return vscode.commands.executeCommand(getFullCommand(id), ...args);
}
