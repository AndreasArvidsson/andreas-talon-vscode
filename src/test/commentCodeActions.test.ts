import * as assert from "assert";
import {
    blockCommentToDocComment,
    lineCommentToDocComment
} from "../language/registerLanguageCodeActions";

type Fixture = [string, string];

const lineFixtures: Fixture[] = [
    ["// foo", "/**\n* foo\n*/"],
    ["  // bar", "  /**\n  * bar\n  */"],
    ["  // foo\n  //bar", "  /**\n  * foo\n  * bar\n  */"]
];

const blockFixtures: Fixture[] = [
    ["  /*foo/*", "  /**foo/*"],
    ["  /* foo /*", "  /** foo /*"],
    ["  /*\n  foo\n  bar\n  */", "  /**\n  * foo\n  * bar\n  */"],
    ["  /*\n  * foo\n  *bar\n  baz\n  */", "  /**\n  * foo\n  *bar\n  * baz\n  */"]
];

suite("Line comment code actions", () => {
    lineFixtures.forEach(([input, expected]) => {
        const name = input.replaceAll("\n", "\\n").trim();
        test(name, () => {
            const actual = lineCommentToDocComment(input);
            assert.equal(actual, expected);
        });
    });
});

suite("Block comment code actions", () => {
    blockFixtures.forEach(([input, expected]) => {
        const name = input.replaceAll("\n", "\\n").trim();
        test(name, () => {
            const actual = blockCommentToDocComment(input);
            assert.equal(actual, expected);
        });
    });
});
