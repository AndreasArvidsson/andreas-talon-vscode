import { runTest } from "./testUtil/runTest";

const command = "getFilename";

suite(command, () => {
    runTest({
        title: command,
        command,
        pre: {},
        post: {
            returnValue: "Untitled-1"
        }
    });
});
