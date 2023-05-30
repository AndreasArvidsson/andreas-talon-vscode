import { runTest } from "./testUtil/runTest";

suite("increment / decrement", () => {
    runTest({
        title: "increment 1",
        command: "increment",
        pre: {
            content: "1",
            selections: [0, 0, 0, 1]
        },
        post: {
            content: "2"
        }
    });

    runTest({
        title: "increment -1",
        command: "increment",
        pre: {
            content: "-1",
            selections: [0, 0, 0, 2]
        },
        post: {
            content: "0",
            selections: [0, 0, 0, 1]
        }
    });

    runTest({
        title: "increment 0.5",
        command: "increment",
        pre: {
            content: "0.5",
            selections: [0, 0, 0, 3]
        },
        post: {
            content: "0.6"
        }
    });

    runTest({
        title: "increment -0.5",
        command: "increment",
        pre: {
            content: "-0.5",
            selections: [0, 0, 0, 4]
        },
        post: {
            content: "-0.4"
        }
    });

    runTest({
        title: "increment a1b2c",
        command: "increment",
        pre: {
            content: "a1b2c",
            selections: [0, 0, 0, 5]
        },
        post: {
            content: "a2b3c"
        }
    });

    runTest({
        title: "decrement 1",
        command: "decrement",
        pre: {
            content: "1",
            selections: [0, 0, 0, 1]
        },
        post: {
            content: "0"
        }
    });

    runTest({
        title: "decrement -1",
        command: "decrement",
        pre: {
            content: "-1",
            selections: [0, 0, 0, 2]
        },
        post: {
            content: "-2"
        }
    });

    runTest({
        title: "decrement 0.5",
        command: "decrement",
        pre: {
            content: "0.5",
            selections: [0, 0, 0, 3]
        },
        post: {
            content: "0.4"
        }
    });

    runTest({
        title: "decrement -0.5",
        command: "decrement",
        pre: {
            content: "-0.5",
            selections: [0, 0, 0, 4]
        },
        post: {
            content: "-0.6"
        }
    });

    runTest({
        title: "decrement a1b2c",
        command: "decrement",
        pre: {
            content: "a1b2c",
            selections: [0, 0, 0, 5]
        },
        post: {
            content: "a0b1c"
        }
    });
});
