import assert from "node:assert/strict";
import type { TextDocument, TextLine } from "vscode";
import { Position } from "vscode";
import { getTalonMatchAtPosition } from "../language/matchers";

suite("Talon matchers", () => {
    test("Matches a list reference in Unicode mode", () => {
        const document = createDocument("{user.foo}: command");
        const position = new Position(0, 6);
        const expected = {
            type: "list",
            name: "user.foo",
        };
        const actual = getTalonMatchAtPosition(document, position);
        assert.deepEqual(actual, expected);
    });

    test("Treats dots in names literally", () => {
        const document = createDocument("{userXfoo}: command");
        const position = new Position(0, 6);
        const actual = getTalonMatchAtPosition(document, position);
        assert.equal(actual, undefined);
    });
});

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
