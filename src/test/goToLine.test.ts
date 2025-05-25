import { runTest } from "./testUtil/runTest";

const command = "goToLine";

suite(command, () => {
    runTest({
        title: command,
        command: { id: command, args: [1] },
        pre: {
            content: "a\n  b",
            selections: [0, 0],
        },
        post: {
            selections: [1, 2],
        },
    });
});
