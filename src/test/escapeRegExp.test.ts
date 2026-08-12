import assert from "node:assert/strict";
import { escapeRegExp } from "../util/escapeRegExp";

suite("escapeRegExp", () => {
    test("escapes regular expression syntax", () => {
        const value = [".*+?^", "$", "{}()|[]", "\\"].join("");
        const regex = new RegExp(`^${escapeRegExp(value)}$`, "u");

        assert.equal(regex.test(value), true);
    });
});
