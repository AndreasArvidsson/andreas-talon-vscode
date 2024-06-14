import { runTest } from "./testUtil/runTest";

const command = "getOpenTagName";

suite(command, () => {
    function testLanguage(languageId: string) {
        runTest({
            title: `${command} - ${languageId}`,
            command,
            pre: {
                language: languageId,
                content: "<div><span></div>\n",
                selections: [0, 11]
            },
            post: {
                returnValue: "span"
            }
        });
    }

    testLanguage("xml");
    testLanguage("html");
    testLanguage("typescriptreact");
    testLanguage("javascriptreact");
    testLanguage("javascript");
});
