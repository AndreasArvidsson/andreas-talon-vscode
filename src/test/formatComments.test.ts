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
            { title: "Line | Splitting", pre: "// aaa bbb ccc", post: "// aaa bbb\n// ccc" },
            { title: "Line | Joining", pre: "// a\n// b\n// c", post: "// a b c" },
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
            { title: "Block | Preserve single line", pre: "/*a*/", post: "/* a */" },
            {
                title: "Block | With indentation",
                pre: "  /*\naaa bbb ccc\n*/",
                post: "  /*\n  aaa bbb\n  ccc\n  */"
            },
            {
                title: "Block | Splitting",
                pre: "/* aaa bbb ccc */",
                post: "/*\naaa bbb\nccc\n*/"
            },
            {
                title: "Block | Joining",
                pre: "/*\naaa\nbbb\nccc\n*/",
                post: "/*\naaa bbb\nccc\n*/"
            },
            {
                title: "Block | Preserve empty",
                pre: "/*\naaa\n\nccc\n*/",
                post: "/*\naaa\n\nccc\n*/"
            },
            {
                title: "Block | Preserve dash",
                pre: "/*\naaa\n-\nccc\n*/",
                post: "/*\naaa\n-\nccc\n*/"
            },
            { title: "JSDoc | Preserve single line", pre: "/**a*/", post: "/** a */" },
            {
                title: "JSDoc | With indentation",
                pre: "  /**\naaa bbb ccc\n*/",
                post: "  /**\n   * aaa\n   * bbb\n   * ccc\n   */"
            },
            {
                title: "JSDoc | Splitting",
                pre: "/** aaa bbb ccc */",
                post: "/**\n * aaa bbb\n * ccc\n */"
            },
            {
                title: "JSDoc | Joining",
                pre: "/**\naaa\nbbb\nccc\n*/",
                post: "/**\n * aaa bbb\n * ccc\n */"
            },
            {
                title: "JSDoc | Preserve empty",
                pre: "/**\n*aaa\n*\n*ccc\n*/",
                post: "/**\n * aaa\n *\n * ccc\n */"
            },
            {
                title: "JSDoc | Preserve dash",
                pre: "/**\n*aaa\n*-\n*ccc\n*/",
                post: "/**\n * aaa\n * -\n * ccc\n */"
            },
            {
                title: "JSDoc | Add asterisks",
                pre: "/**\naaa\n\nccc\n*/",
                post: "/**\n * aaa\n *\n * ccc\n */"
            }
        ]
    }
];

// TODO: Reactivate all tests
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
