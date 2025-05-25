import * as assert from "node:assert";
import { hintToIndex, indexToHint } from "../util/hints";

const fixtures: Record<string, number> = {
    a: 0,
    b: 1,
    y: 24,
    z: 25,
    aa: 26,
    ab: 27,
    az: 51,
    ba: 52,
    bz: 77,
    zz: 701,
};

suite("hints", () => {
    Object.entries(fixtures).forEach(([hint, index]) => {
        test(`${hint} => ${index}`, () => {
            assert.equal(hintToIndex(hint), index);
        });

        test(`${index} => ${hint}`, () => {
            assert.equal(indexToHint(index).toLowerCase(), hint);
        });
    });
});
