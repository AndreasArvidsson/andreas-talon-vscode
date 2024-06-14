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

    testLanguage("html");
    testLanguage("typescriptreact");
    testLanguage("javascriptreact");
    testLanguage("javascript");

    // Xml errors when there is no closing tag
    runTest({
        title: `${command} - xml`,
        command,
        pre: {
            language: "xml",
            content: "<div><span></span></div>\n",
            selections: [0, 11]
        },
        post: {
            returnValue: "span"
        }
    });
});
