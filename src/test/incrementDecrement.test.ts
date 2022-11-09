import { runTest } from "./testUtil/runTest";

suite("increment / decrement", async function () {
    runTest({
        title: "increment 1",
        command: "increment",
        pre: {
            content: "1",
            selections: [0, 0, 0, 1],
        },
        post: {
            content: "2",
        },
    });

    runTest({
        title: "increment 0.5",
        command: "increment",
        pre: {
            content: "0.5",
            selections: [0, 0, 0, 3],
        },
        post: {
            content: "0.6",
        },
    });

    runTest({
        title: "decrement 1",
        command: "decrement",
        pre: {
            content: "1",
            selections: [0, 0, 0, 1],
        },
        post: {
            content: "0",
        },
    });

    runTest({
        title: "decrement 0.5",
        command: "decrement",
        pre: {
            content: "0.5",
            selections: [0, 0, 0, 3],
        },
        post: {
            content: "0.4",
        },
    });
});
