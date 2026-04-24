import * as assert from "node:assert/strict";
import { splitName } from "../util/getRenameContext";

const fixtures: [string, string, string | undefined][] = [
    [".gitignore", ".gitignore", undefined],
    ["foo.txt", "foo", ".txt"],
    ["foo.bar.txt", "foo.bar", ".txt"],
    ["foo.test.txt", "foo", ".test.txt"],
];

suite("splitName", () => {
    for (const [input, expectedName, expectedExt] of fixtures) {
        test(input, () => {
            const { name, ext } = splitName(input);
            assert.equal(name, expectedName);
            assert.equal(ext, expectedExt);
        });
    }
});
