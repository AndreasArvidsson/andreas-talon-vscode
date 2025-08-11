import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";

type Content = string | string[];

const fixtures: { title: string; pre: Content; post: Content }[] = [
    {
        title: "Named nodes",
        pre: ["(aaa", "    (bbb", "      (ccc)", "    ", ")", ")"],
        post: ["(aaa", "    (bbb", "        (ccc)", "    )", ")", ""],
    },
    {
        title: "Anonymous node",
        pre: '";" ?  @namedFunction.end  @functionName.domain.end',
        post: '";"? @namedFunction.end @functionName.domain.end\n',
    },
    {
        title: "Trailing ?",
        pre: '(("." (type))?)?',
        post: `\
(
    (
        "."
        (type)
    )?
)?
`,
    },
    {
        title: "Large file",
        pre: `\
;; Define this here because the 'field_definition' node type doesn't exist
;; in typescript.
(
    ;;!! class Foo {
    ;;!!   foo = () => {};
    ;;!    ^^^^^^^^^^^^^^^
   ;;!!   foo = function() {};
    ;;!    ^^^^^^^^^^^^^^^^^^^^
    ;;!!   foo = function *() {};
    ;;!    ^^^^^^^^^^^^^^^^^^^^^^
    ;;!! }
  (field_definition
    property:(_)@functionName
    value:[
        (function
        !name
        )
        (generator_function
        !name
        )
        (arrow_function)
    ]
    )@namedFunction.start   @functionName.domain.start
    .
    ";" ?@namedFunction.end  @functionName.domain.end
)`,
        post: `\
;; Define this here because the 'field_definition' node type doesn't exist
;; in typescript.
(
    ;;!! class Foo {
    ;;!!   foo = () => {};
    ;;!    ^^^^^^^^^^^^^^^
    ;;!!   foo = function() {};
    ;;!    ^^^^^^^^^^^^^^^^^^^^
    ;;!!   foo = function *() {};
    ;;!    ^^^^^^^^^^^^^^^^^^^^^^
    ;;!! }
    (field_definition
        property: (_) @functionName
        value: [
            (function
                !name
            )
            (generator_function
                !name
            )
            (arrow_function)
        ]
    ) @namedFunction.start @functionName.domain.start
    .
    ";"? @namedFunction.end @functionName.domain.end
)
`,
    },
];

suite("Tree-sitter formatter", () => {
    for (const fixture of fixtures) {
        runTest({
            title: fixture.title,
            callback: () =>
                commands.executeCommand("editor.action.formatDocument"),
            pre: {
                language: "scm",
                content: getContentString(fixture.pre),
            },
            post: {
                content: getContentString(fixture.post),
            },
        });
    }
});

function getContentString(content: Content): string {
    return Array.isArray(content) ? content.join("\n") : content;
}
