import { runTest } from "./testUtil/runTest";

const command = "getSelectedText";

suite(command, () => {
    runTest({
        title: "Single selection",
        command,
        pre: {
            content: "_abc_",
            selections: [0, 1, 0, 4],
        },
        post: {
            returnValue: ["abc"],
        },
    });

    runTest({
        title: "Double selections",
        command,
        pre: {
            content: "abc",
            selections: [
                [0, 0, 0, 1],
                [0, 2, 0, 3],
            ],
        },
        post: {
            returnValue: ["a", "c"],
        },
    });
});
