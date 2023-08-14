import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";
import { NumberSelection } from "./testUtil/test.types";

type Content = string | string[];

const fixtures: { title: string; pre: Content; post: Content; selections?: NumberSelection }[] = [
    {
        title: "Key order",
        selections: [0, 1],
        pre: `\
$0.wrapperScope: statement
$0.phrase: try
$foo.phrase: bar
$1.phrase: catch
$1.wrapperScope: statement
phrase: try catch
language: javascript
name: mySnippet`,
        post: `\
name: mySnippet
language: javascript
phrase: try catch

$1.phrase: catch
$1.wrapperScope: statement
$foo.phrase: bar
$0.phrase: try
$0.wrapperScope: statement
---
`
    },
    {
        title: "Empty lines",
        pre: `
name: foo
-
  
  foo  
  
 bar 
baz `,
        post: `\
name: foo
-
  foo

 bar
baz
---
`
    },
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
language: javascript|  java
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

language: javascript | java
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
---
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
                content: getContentString(fixture.post),
                selections: fixture.selections
            }
        });
    }
});

function getContentString(content: Content): string {
    return Array.isArray(content) ? content.join("\n") : content;
}
