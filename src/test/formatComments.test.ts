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
            { title: "Line | Missing leading space", pre: "//aaa", post: "// aaa" },
            { title: "Line | Extra leading space", pre: "//  aaa", post: "// aaa" },
            { title: "Line | With indentation", pre: "  //aaa bbb", post: "  // aaa\n  // bbb" },
            { title: "Line | Splitting", pre: "// aaa bbb", post: "// aaa\n// bbb" },
            { title: "Line | Joining", pre: "// a\n// b", post: "// a b" },
            { title: "Line | Preserve empty", pre: "// a\n//\n// b", post: "// a\n//\n// b" },
            { title: "Line | Preserve dash", pre: "// a\n//-\n// b", post: "// a\n// -\n// b" },
            {
                title: "Line | Long",
                pre: "// Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                post: [
                    "// Lorem",
                    "// ipsum",
                    "// dolor",
                    "// sit",
                    "// amet,",
                    "// consectetur",
                    "// adipiscing",
                    "// elit"
                ]
            },
            { title: "Block | Preserve single line", pre: "/* a */", post: "/* a */" }
        ]
    }
];

suite.only("Comment formatter", () => {
    for (const language of languages) {
        for (const fixture of language.fixtures) {
            runTest({
                title: `${language.id} | ${fixture.title}`,
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
