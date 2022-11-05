import { runTest } from "./runTest";

const command = { id: "lineMiddle" };

suite(command.id, async function () {
    runTest({
        title: "Text",
        command,
        pre: {
            content: "  aa",
        },
        post: {
            selections: [[0, 3]],
        },
    });

    runTest({
        title: "Whitespace",
        command,
        pre: {
            content: "    ",
        },
        post: {
            selections: [[0, 2]],
        },
    });
});
