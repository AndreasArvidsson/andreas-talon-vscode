import { runTest } from "./testUtil/runTest";

const command = "getDocumentText";

suite(command, () => {
    runTest({
        title: "Single line",
        command,
        pre: {
            content: "_abc_",
        },
        post: {
            returnValue: "_abc_",
        },
    });

    runTest({
        title: "Multiple lines",
        command,
        pre: {
            content: "foo\nbar",
        },
        post: {
            returnValue: "foo\nbar",
        },
    });
});
