import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";

type Content = string | string[];

const fixtures: { title: string; pre: Content; post: Content }[] = [
    {
        title: "Large file",
        pre: `\

name:tryCatchStatement
phrase   :  try catch


$1.phrase:try
$1.wrapperScope  :   statement
    $0.phrase:catch
    $0.wrapperScope :statement
---

language: javascript
-
try {
    $1
}
catch(error) {
    $0
} ---
a: b
---

language: python
-

try:
    $1
except Exception as ex:
    $0`,
        post: `\
name: tryCatchStatement
phrase: try catch

$1.phrase: try
$1.wrapperScope: statement
$0.phrase: catch
$0.wrapperScope: statement
---

language: javascript
-
try {
    $1
}
catch(error) {
    $0
} ---
a: b
---

language: python
-

try:
    $1
except Exception as ex:
    $0
`
    }
];

suite("Snippet formatter", () => {
    for (const fixture of fixtures) {
        runTest({
            title: fixture.title,
            callback: () => commands.executeCommand("editor.action.formatDocument"),
            pre: {
                language: "snippet",
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
