import { runTest } from "./testUtil/runTest";

const command = "openEditorAtIndex";

suite(command, async function () {
    // For now just assert that the command is not throwing any errors
    runTest({
        title: command,
        command: { id: command, args: [0] },
        pre: {},
        post: {},
    });
});
