import { runTest } from "./testUtil/runTest";

const command = "getDictationContext";

suite(command, () => {
    runTest({
        title: "Multiple selections",
        command,
        pre: {
            content: "ab",
            selections: [
                [0, 0],
                [1, 1],
            ],
        },
        post: {
            returnValue: null,
        },
    });

    runTest({
        title: "Empty selection",
        command,
        pre: {
            content: "abcd",
            selections: [0, 2],
        },
        post: {
            returnValue: { before: "ab", after: "cd" },
        },
    });

    runTest({
        title: "Cursor at start of line",
        command,
        pre: {
            content: "abcd",
            selections: [0, 0],
        },
        post: {
            returnValue: { before: "", after: "ab" },
        },
    });

    runTest({
        title: "Cursor at end of line",
        command,
        pre: {
            content: "abcd",
            selections: [0, 4],
        },
        post: {
            returnValue: { before: "cd", after: "" },
        },
    });

    runTest({
        title: "Non-empty selection",
        command,
        pre: {
            content: "ab_cd",
            selections: [0, 2, 0, 3],
        },
        post: {
            returnValue: { before: "ab", after: "cd" },
        },
    });
});
