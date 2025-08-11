import { commands } from "vscode";
import { runTest } from "./testUtil/runTest";
import { NumberSelection } from "./testUtil/test.types";

type Content = string | string[];

const fixtures: {
    title: string;
    pre: Content;
    post: Content;
    selections?: NumberSelection;
}[] = [
    {
        title: "Key order",
        selections: [0, 1],
        pre: `\
$0.wrapperScope: statement
$0.wrapperPhrase: try
$0.insertionFormatter: PASCAL_CASE
$foo.wrapperPhrase: bar
$1.wrapperPhrase: catch
$1.wrapperScope: statement
insertionScope: statement
phrase: try catch
language: javascript
description: My snippet
name: mySnippet`,
        post: `\
name: mySnippet
description: My snippet
language: javascript
phrase: try catch
insertionScope: statement

$1.wrapperPhrase: catch
$1.wrapperScope: statement
$foo.wrapperPhrase: bar
$0.insertionFormatter: PASCAL_CASE
$0.wrapperPhrase: try
$0.wrapperScope: statement
---
`,
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
`,
    },
    {
        title: "Empty snippet document",
        pre: `\
name: test
---

---
phrase: test
-
test
`,
        post: `\
name: test
---

phrase: test
-
test
---
`,
    },
    {
        title: "- in body",
        pre: `\
name: test
-
a
-
b
`,
        post: `\
name: test
-
a
-
b
---
`,
    },
    {
        title: "Empty file",
        pre: "",
        post: "",
    },
    {
        title: "Large file",
        pre: `\

name:tryCatchStatement
insertionScope: statement|namedFunction
phrase   :  try catch  |  try


$1.insertionFormatter: PASCAL_CASE
$1.wrapperPhrase:try|trying
$1.wrapperScope  :   statement
    $0.wrapperPhrase:catch
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
phrase: try catch | try
insertionScope: statement | namedFunction

$1.insertionFormatter: PASCAL_CASE
$1.wrapperPhrase: try | trying
$1.wrapperScope: statement
$0.wrapperPhrase: catch
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
`,
    },
];

suite("Snippet formatter", () => {
    for (const fixture of fixtures) {
        runTest({
            title: fixture.title,
            callback: () =>
                commands.executeCommand("editor.action.formatDocument"),
            pre: {
                language: "snippet",
                content: getContentString(fixture.pre),
            },
            post: {
                content: getContentString(fixture.post),
                selections: fixture.selections,
            },
        });
    }
});

function getContentString(content: Content): string {
    return Array.isArray(content) ? content.join("\n") : content;
}
