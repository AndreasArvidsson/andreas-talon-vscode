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
            "parrot( pop )  :  'parrot'",
            "noise( pop )  :  'noise'",
            "face( smile )  :  'face'"
        ],
        post: [
            "tag(): user.some_tag",
            "key(enter):                 'key'",
            "gamepad(north):             'gamepad'",
            "parrot(pop):                'parrot'",
            "noise(pop):                 'noise'",
            "face(smile):                'face'",
            ""
        ]
    },

    {
        title: "CRLF comment",
        pre: "# Hello\r\nfoo: 'bar'",
        post: "# Hello\r\nfoo:                        'bar'\r\n"
    },

    {
        title: "Custom column width",
        pre: "# fmt: columnWidth=5\nfoo: 'bar'",
        post: "# fmt: columnWidth=5\nfoo: 'bar'\n"
    },

    {
        title: "Large file",
        pre: `\
not   mode  : command
tag :  stuff
-

some command : 
    # stuff
    edit.left(  )
    key(  enter  )
    key(  enter  )
    sleep(   200ms  )
    user.too_stuff( 5 ,  7  , true  ,  false  ) 
    
command    :                    "command"

# hello


tag() :  user.some_tag

settings() :
    speech.debug  =  1
    speech.stuff  =  1

key(  enter  )  :        "enter hello"
gamepad(  north  )  :         "north"
face(  smile  )  :        "smile"
parrot(  pop  )  :           "pop"
noise(  pop  )  :         "noise"
deck(  stuff  )  :      "deck"

slap  :
    key(  end  )
    key(  enter  )

# Uncomment this to enable the curse yes/curse no commands (show hide mouse cursor). See issue #688.
# tag(): user.mouse_cursor_commands_enable`,
        post: `\
not mode: command
tag: stuff
-

some command:
    # stuff
    edit.left()
    key(enter)
    key(enter)
    sleep(200ms)
    user.too_stuff(5, 7, true, false)

command:                    "command"

# hello

tag(): user.some_tag

settings():
    speech.debug = 1
    speech.stuff = 1

key(enter):                 "enter hello"
gamepad(north):             "north"
face(smile):                "smile"
parrot(pop):                "pop"
noise(pop):                 "noise"
deck(stuff):                "deck"

slap:
    key(end)
    key(enter)

# Uncomment this to enable the curse yes/curse no commands (show hide mouse cursor). See issue #688.
# tag(): user.mouse_cursor_commands_enable
`
    }
];

suite("Talon formatter", () => {
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
