import { FullTestFixture, NumberSelection, TestFixture } from "./test.types";

export function getFullFixture(fixture: TestFixture): FullTestFixture {
    const { title, command, pre, post } = fixture;
    return {
        title,
        command: {
            id: typeof command === "object" ? command.id : command,
            args: (typeof command === "object" ? command.args : null) ?? [],
        },
        pre: {
            language: pre.language ?? "plaintext",
            content: pre.content ?? "",
            selections: getSelections(pre.selections),
        },
        post: {
            language: post.language ?? pre.language ?? "plaintext",
            content: post.content ?? pre.content ?? "",
            selections: getSelections(post.selections ?? pre.selections),
            returnValue: post.returnValue,
        },
    };
}

function getSelections(
    selections?: NumberSelection[] | NumberSelection
): NumberSelection[] {
    if (selections == null) {
        return [[0, 0, 0, 0]];
    }
    if (Array.isArray(selections[0])) {
        return selections as NumberSelection[];
    }
    return [selections as NumberSelection];
}
