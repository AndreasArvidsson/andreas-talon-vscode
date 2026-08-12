import assert from "node:assert/strict";
import type { Position, TextDocument, TextLine } from "vscode";
import { getTalonMatchAtPosition } from "../language/matchers";

function createDocument(text: string): TextDocument {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return {
        lineAt: () =>
            // oxlint-disable-next-line typescript/no-unsafe-type-assertion
            ({
                text,
                firstNonWhitespaceCharacterIndex: 0,
            }) as TextLine,
        getWordRangeAtPosition: () => ({
            isEmpty: false,
            isSingleLine: true,
        }),
        getText: () => "user.foo",
    } as unknown as TextDocument;
}

suite("Talon matchers", () => {
    test("matches a list reference in Unicode mode", () => {
        const document = createDocument("command: {user.foo}");
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const position = { line: 0, character: 16 } as Position;

        assert.deepEqual(getTalonMatchAtPosition(document, position), {
            type: "list",
            name: "user.foo",
        });
    });

    test("treats dots in names literally", () => {
        const document = createDocument("command: {userXfoo}");
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        const position = { line: 0, character: 16 } as Position;

        assert.equal(getTalonMatchAtPosition(document, position), undefined);
    });
});
