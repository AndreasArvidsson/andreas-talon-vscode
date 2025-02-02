import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";

type Content = string | string[];

interface Fixture {
    title: string;
    pre: Content;
    post: Content;
}

interface Language {
    id: string;
    fixtures: Fixture[];
}

const languages: Language[] = [
    {
        id: "javascript",
        fixtures: [
            { title: "Missing leading space", pre: "//aaa", post: "// aaa" },
            { title: "Extra leading space", pre: "//  aaa", post: "// aaa" },
            { title: "Wrapping", pre: "// aaa bbb", post: "// aaa\n// bbb" }
            // { title: "", pre: "", post: "" },
            // { title: "", pre: "", post: "" },
            // { title: "", pre: "", post: "" },
            // { title: "", pre: "", post: "" },
            // { title: "", pre: "", post: "" },
            // { title: "", pre: "", post: "" },
            // { title: "", pre: "", post: "" },
        ]
    }
];

suite.only("Comment formatter", () => {
    for (const language of languages) {
        for (const fixture of language.fixtures) {
            runTest({
                title: `${language.id}: ${fixture.title}`,
                callback: () => commands.executeCommand("andreas.formatComments"),
                pre: {
                    language: language.id,
                    content: getContentString(fixture.pre)
                },
                post: {
                    content: getContentString(fixture.post)
                }
            });
        }
    }
});

function getContentString(content: Content): string {
    return Array.isArray(content) ? content.join("\n") : content;
}
