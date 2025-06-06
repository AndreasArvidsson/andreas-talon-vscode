import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";
import type { NumberSelection } from "./testUtil/test.types";

type Content = string | string[];

interface Test {
    title: string;
    pre: Content;
    post: Content;
    preSelections?: NumberSelection;
    postSelections?: NumberSelection;
}

interface Language {
    id: string;
    tests: Test[];
}

function createLineTests(prefix: string): Test[] {
    return templateLineTests.map((test) => ({
        title: test.title,
        pre: getContentString(test.pre).replaceAll("#", prefix),
        post: getContentString(test.post).replaceAll("#", prefix),
    }));
}

function createBlockTests(prefix: string, suffix: string): Test[] {
    return templateBlockTests.map((test) => ({
        title: test.title,
        pre: getContentString(test.pre).replaceAll("/*", prefix).replaceAll("*/", suffix),
        post: getContentString(test.post).replaceAll("/*", prefix).replaceAll("*/", suffix),
    }));
}

function tests(languageIds: string[], tests: Test[]): Language[] {
    return languageIds.map((id) => ({
        id,
        tests,
    }));
}

const templateLineTests: Test[] = [
    { title: "Line | Missing leading space", pre: "#aaa", post: "# aaa" },
    { title: "Line | Extra leading space", pre: "#  aaa", post: "# aaa" },
    { title: "Line | With indentation", pre: "  #aaa bbb", post: "  # aaa\n  # bbb" },
    { title: "Line | Inline", pre: "aaa # bbb ccc ddd", post: "aaa # bbb ccc ddd" },
    { title: "Line | Splitting", pre: "# aaa bbb ccc", post: "# aaa bbb\n# ccc" },
    { title: "Line | Joining", pre: "# a\n# b\n# c", post: "# a b c" },
    { title: "Line | Preserve empty", pre: "# a\n#\n# b", post: "# a\n#\n# b" },
    { title: "Line | Preserve dash", pre: "# a\n# -\n# b", post: "# a\n# -\n# b" },
    { title: "Line | Separate comments", pre: "# a\n\n# b", post: "# a\n\n# b" },
    { title: "Line | CRLF", pre: "# a\r\n# -\r\n# b", post: "# a\r\n# -\r\n# b" },
    {
        title: "Line | Long",
        pre: "# Lorem ipsum dolor sit amet, consectetur adipiscing elit",
        post: [
            "# Lorem",
            "# ipsum",
            "# dolor",
            "# sit",
            "# amet,",
            "# consectetur",
            "# adipiscing",
            "# elit",
        ],
    },
];

const pythonLineTests: Test[] = [
    ...templateLineTests,
    {
        title: "Line | Selection",
        pre: "# a\n# b\n# c",
        post: "# a b\n# c",
        preSelections: [0, 0, 1, 0],
        postSelections: [0, 0, 0, 4],
    },
];

const cLineTests = createLineTests("//");
const luaLineTests = createLineTests("--");

const templateBlockTests: Test[] = [
    { title: "Block | Preserve single line", pre: "  /*a*/", post: "  /* a */" },
    {
        title: "Block | With indentation",
        pre: "  /*\naaa bbb ccc\n*/",
        post: "  /*\n  aaa bbb\n  ccc\n  */",
    },
    {
        title: "Block | Splitting",
        pre: "/* aaa bbb ccc */",
        post: "/*\naaa bbb\nccc\n*/",
    },
    {
        title: "Block | Joining",
        pre: "/*\naaa\nbbb\nccc\n*/",
        post: "/*\naaa bbb\nccc\n*/",
    },
    {
        title: "Block | Preserve empty",
        pre: "/*\naaa\n\nccc\n*/",
        post: "/*\naaa\n\nccc\n*/",
    },
    {
        title: "Block | Preserve dash",
        pre: "/*\naaa\n-\nccc\n*/",
        post: "/*\naaa\n-\nccc\n*/",
    },
];

const javaDocTests: Test[] = [
    { title: "Doc | Preserve single line", pre: "  /**a*/", post: "  /** a */" },
    {
        title: "Doc | With indentation",
        pre: "  /**\naaa bbb ccc\n*/",
        post: "  /**\n   * aaa\n   * bbb\n   * ccc\n   */",
    },
    {
        title: "Doc | Splitting",
        pre: "/** aaa bbb ccc */",
        post: "/**\n * aaa bbb\n * ccc\n */",
    },
    {
        title: "Doc | Joining",
        pre: "/**\naaa\nbbb\nccc\n*/",
        post: "/**\n * aaa bbb\n * ccc\n */",
    },
    {
        title: "Doc | Preserve empty",
        pre: "/**\n*aaa\n*\n*ccc\n*/",
        post: "/**\n * aaa\n *\n * ccc\n */",
    },
    {
        title: "Doc | Preserve dash",
        pre: "/**\n*aaa\n*-\n*ccc\n*/",
        post: "/**\n * aaa\n * -\n * ccc\n */",
    },
    {
        title: "Doc | Add asterisks",
        pre: "/**\naaa\n\nccc\n*/",
        post: "/**\n * aaa\n *\n * ccc\n */",
    },
];

const xmlBlockTests: Test[] = createBlockTests("<!--", "-->");

const cBlockTests: Test[] = [
    ...templateBlockTests,
    {
        title: "Block | Line leading",
        pre: "// a\n/* b */",
        post: "// a\n/* b */",
    },
    {
        title: "Block | Line trailing",
        pre: "/* a */\n// b",
        post: "/* a */\n// b",
    },
];

const languages: Language[] = [
    ...tests(["lua"], luaLineTests),

    ...tests(["python", "talon", "talon-list", "yaml"], pythonLineTests),

    ...tests(["xml", "html"], [...xmlBlockTests]),

    ...tests(["json", "jsonc", "jsonl"], cLineTests),

    ...tests(["c", "cpp", "csharp"], [...cLineTests, ...cBlockTests]),

    ...tests(["css"], [...cBlockTests]),

    ...tests(
        ["java", "javascript", "typescript", "javascriptreact", "typescriptreact"],
        [...cLineTests, ...cBlockTests, ...javaDocTests],
    ),
];

suite("Format comments", () => {
    for (const language of languages) {
        for (const fixture of language.tests) {
            runTest({
                title: `${language.id} | ${fixture.title}`,
                callback: () =>
                    commands.executeCommand(
                        fixture.preSelections
                            ? "andreas.formatComments"
                            : "andreas.formatAllComments",
                    ),
                pre: {
                    language: language.id,
                    content: getContentString(fixture.pre),
                    selections: fixture.preSelections,
                },
                post: {
                    content: getContentString(fixture.post),
                    selections: fixture.postSelections,
                },
            });
        }
    }
});

function getContentString(content: Content): string {
    return Array.isArray(content) ? content.join("\n") : content;
}
