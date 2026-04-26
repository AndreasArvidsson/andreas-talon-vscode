import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";

suite("Formatters", () => {
    const callback = (): Thenable<unknown> =>
        commands.executeCommand("editor.action.formatDocument");

    runTest({
        title: "Talon",
        callback,
        pre: {
            language: "talon",
            content: "a:b",
        },
        post: {
            content: "a: b\n",
        },
    });

    runTest({
        title: "Talon list",
        callback,
        pre: {
            language: "talon-list",
            content: "list: l\n-\na:b",
        },
        post: {
            content: "list: l\n-\n\na: b\n",
        },
    });

    runTest({
        title: "Snippet",
        callback,
        pre: {
            language: "snippet",
            content: "name:a\n\nphrase:b\n-\nbody $0",
        },
        post: {
            content: "name: a\nphrase: b\n-\nbody $0\n---\n",
        },
    });

    runTest({
        title: "Tree-sitter query",
        callback,
        pre: {
            language: "scm",
            content: "(aaa(bbb)@ccc)",
        },
        post: {
            content: "(aaa\n    (bbb) @ccc\n)\n",
        },
    });
});
