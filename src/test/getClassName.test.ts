import { runTest } from "./testUtil/runTest";

const command = "getClassName";

suite(command, () => {
    runTest({
        title: command,
        command,
        pre: {
            language: "java",
            content: "class MyClass {\n\n}",
            selections: [1, 0]
        },
        post: {
            returnValue: "MyClass"
        }
    });
});
