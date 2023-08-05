import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";

type Content = string | string[];

const fixtures: { title: string; pre: Content; post: Content }[] = [
    {
        title: "matchers",
        pre: ["app  :  vscode", "", "and  not  mode :  command", "-", ""],
        post: ["app: vscode", "", "and not mode: command", "-", ""]
    },
    {
        title: "command singe line",
        pre: "foo  :  edit.left(  )",
        post: ["foo:                        edit.left()", ""]
    },
    {
        title: "command multi line",
        pre: [
            "foo  : ",
            "  # actions",
            "  edit.left(  )",
            "  key(  enter  )",
            "  sleep(   200ms  )",
            "  user.too_stuff(  5  ,  7  ,  true  ,  false  )"
        ],
        post: [
            "foo:",
            "    # actions",
            "    edit.left()",
            "    key(enter)",
            "    sleep(200ms)",
            "    user.too_stuff(5, 7, true, false)",
            ""
        ]
    },
    {
        title: "settings declaration",
        pre: ["settings()  :  ", "  speech.timeout  =  0.400", "", "  speech.record_all=true"],
        post: ["settings():", "    speech.timeout = 0.400", "", "    speech.record_all = true", ""]
    },
    {
        title: "tag/key/gamepad/parrot/face declarations",
        pre: [
            "tag()  :  user.some_tag",
            "key( enter )  :  'key'",
            "gamepad( north )  :  'gamepad'",
            "parrot( pulp )  :  'parrot'",
            "face( smile )  :  'face'"
        ],
        post: [
            "tag(): user.some_tag",
            "key(enter):                 'key'",
            "gamepad(north):             'gamepad'",
            "parrot(pulp):               'parrot'",
            "face(smile):                'face'",
            ""
        ]
    }
];

suite.only("Talon formatter", () => {
    for (const fixture of fixtures) {
        runTest({
            title: fixture.title,
            callback: () => commands.executeCommand("editor.action.formatDocument"),
            pre: {
                language: "talon",
                content: getContentString(fixture.pre)
            },
            post: {
                content: getContentString(fixture.post)
            }
        });
    }
});

function getContentString(content: Content): string {
    return Array.isArray(content) ? content.join("\n") : content;
}
