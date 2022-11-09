import { runTest } from "./testUtil/runTest";

const command = "selectTo";

suite(command, async function () {
    runTest({
        title: "Extend before",
        command: {
            id: command,
            args: [0],
        },
        pre: {
            content: "a\nb\nc",
            selections: [2, 0],
        },
        post: {
            selections: [2, 0, 0, 0],
        },
    });

    runTest({
        title: "Extend after",
        command: {
            id: command,
            args: [2],
        },
        pre: {
            content: "a\nb\nc",
            selections: [0, 0],
        },
        post: {
            selections: [0, 0, 2, 1],
        },
    });

    runTest({
        title: "Extend same",
        command: {
            id: command,
            args: [1],
        },
        pre: {
            content: "a\nb\nc",
            selections: [1, 0],
        },
        post: {
            selections: [1, 0, 1, 1],
        },
    });
});
