import { runTest } from "./testUtil/runTest";

const command = "generateRange";

suite(command, () => {
    runTest({
        title: command,
        command,
        pre: {
            content: "a\nb\nc",
            selections: [
                [0, 1],
                [1, 1],
                [2, 1],
            ],
        },
        post: {
            content: "a1\nb2\nc3",
            selections: [
                [0, 2],
                [1, 2],
                [2, 2],
            ],
        },
    });
});
