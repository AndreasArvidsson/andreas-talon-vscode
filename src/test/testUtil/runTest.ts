import * as assert from "assert";
import * as vscode from "vscode";
import { getFullFixture } from "./getFullFixture";
import openNewEditor from "./openNewEditor";
import {
    numbersToPlainSelections,
    numbersToSelections,
    selectionsToPlainSelections,
} from "./selectionUtil";
import { FullTestFixture, TestFixture } from "./test.types";

export const runTest = (fixture: TestFixture): void => {
    test(fixture.title, async () => {
        const fullFixture = getFullFixture(fixture);

        const editor = await openEditor(fullFixture);

        const returnValue = await fullFixture.callback();

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

    assert.equal(editor.document.languageId, language);
    assert.equal(editor.document.getText(), content);
    assert.deepEqual(actualReturnValue, returnValue);

    assert.deepEqual(
        selectionsToPlainSelections(editor.selections),
        numbersToPlainSelections(selections)
    );
}
