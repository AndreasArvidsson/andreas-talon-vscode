import { runTest } from "./testUtil/runTest";

const command = "lineMiddle";

suite(command, async function () {
    runTest({
        title: "Text",
        command,
        pre: {
            content: "  aa",
        },
        post: {
            selections: [0, 3],
        },
    });

    runTest({
        title: "Whitespace",
        command,
        pre: {
            content: "    ",
        },
        post: {
            selections: [0, 2],
        },
    });
});
