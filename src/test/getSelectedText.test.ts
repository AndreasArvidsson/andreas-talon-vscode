import { runTest } from "./runTest";

const command = { id: "getSelectedText" };

suite(command.id, async function () {
    runTest({
        title: command.id,
        command,
        pre: {
            content: "_abc_",
            selections: [0, 1, 0, 4],
        },
        post: {
            returnValue: "abc",
        },
    });
});
