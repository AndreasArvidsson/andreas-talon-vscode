import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";
import type { NumberSelection } from "./testUtil/test.types";

const fixtures: { title: string; pre: string; post: string; selections?: NumberSelection }[] = [
    {
        title: "large",
        pre: `
list :user.my_list 

-
  air   :a

bat: b`,
        post: `list: user.my_list
-

air:      a

bat:      b
`,
    },

    {
        title: "Multiple headers",
        pre: "app: app\nlist: l\n-\na:b",
        post: "list: l\napp: app\n-\n\na:        b\n",
        selections: [1, 0],
    },

    {
        title: "To much whitespace",
        pre: "\n\nlist: l\n\n\n-\n\n\na:b\n\n",
        post: "list: l\n-\n\na:        b\n",
    },

    {
        title: "Comment",
        pre: "\n\nlist: l\n-\n#c:c\na:b",
        post: "list: l\n-\n\n#c:c\na:        b\n",
    },

    {
        title: "CRLF",
        pre: "list: l\r\n-\r\na:b",
        post: "list: l\r\n-\r\n\r\na:        b\r\n",
    },

    {
        title: "Custom column width",
        pre: "list: l\n-\n# fmt: columnWidth=5\na:b",
        post: "list: l\n-\n\n# fmt: columnWidth=5\na:   b\n",
    },
];

suite("Talon list formatter", () => {
    for (const fixture of fixtures) {
        runTest({
            title: fixture.title,
            callback: () => commands.executeCommand("editor.action.formatDocument"),
            pre: {
                language: "talon-list",
                content: fixture.pre,
            },
            post: {
                content: fixture.post,
                selections: fixture.selections,
            },
        });
    }
});
