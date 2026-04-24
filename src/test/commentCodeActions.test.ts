import * as assert from "node:assert/strict";
import {
    blockCommentToDocComment,
    lineCommentToDocComment,
} from "../language/registerLanguageCodeActions";

type Fixture = [string, string];

const lineFixtures: Fixture[] = [
    ["// foo", "/**\n* foo\n*/"],
    ["  // bar", "  /**\n  * bar\n  */"],
    ["  // foo\n  //bar", "  /**\n  * foo\n  * bar\n  */"],
];

const blockFixtures: Fixture[] = [
    ["  /*foo/*", "  /**foo/*"],
    ["  /* foo /*", "  /** foo /*"],
    ["  /*\n  foo\n  bar\n  */", "  /**\n  * foo\n  * bar\n  */"],
    [
        "  /*\n  * foo\n  *bar\n  baz\n  */",
        "  /**\n  * foo\n  *bar\n  * baz\n  */",
    ],
];

suite("Line comment code actions", () => {
    for (const [input, expected] of lineFixtures) {
        const name = input.replaceAll("\n", String.raw`\n`).trim();
        test(name, () => {
            const actual = lineCommentToDocComment(input);
            assert.equal(actual, expected);
        });
    }
});

suite("Block comment code actions", () => {
    for (const [input, expected] of blockFixtures) {
        const name = input.replaceAll("\n", String.raw`\n`).trim();
        test(name, () => {
            const actual = blockCommentToDocComment(input);
            assert.equal(actual, expected);
        });
    }
});
