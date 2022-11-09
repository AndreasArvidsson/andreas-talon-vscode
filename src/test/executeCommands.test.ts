import { runTest } from "./testUtil/runTest";

const command = "executeCommands";

suite(command, async function () {
    runTest({
        title: command,
        command: {
            id: command,
            args: [
                [
                    "editor.action.insertLineAfter",
                    "editor.action.insertLineAfter",
                ],
            ],
        },
        pre: {
            content: "",
        },
        post: {
            content: "\n\n",
            selections: [2, 0],
        },
    });
});
