import { runTest } from "./testUtil/runTest";

const command = "getClassName";

suite(command, async function () {
    console.debug = () => {
        // The parse tree extensions spams debug logs
    };

    runTest({
        title: command,
        command,
        pre: {
            language: "java",
            content: "class MyClass {\n\n}",
            selections: [1, 0],
        },
        post: {
            returnValue: "MyClass",
        },
    });
});
