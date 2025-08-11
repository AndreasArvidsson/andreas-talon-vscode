import { commands } from "vscode";
import { getFullCommand } from "../../util/getFullCommand";
import type {
    FullTestFixture,
    NumberSelection,
    TestFixture,
} from "./test.types";

export function getFullFixture(fixture: TestFixture): FullTestFixture {
    const { title, pre, post } = fixture;

    return {
        title,
        callback: getCallback(fixture),
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

function getCallback(fixture: TestFixture): () => Thenable<unknown> {
    if (fixture.callback != null) {
        return fixture.callback;
    }

    const { command } = fixture;
    const id = typeof command === "object" ? command.id : command;
    const args: unknown[] = typeof command === "object" ? command.args : [];

    return () => {
        return commands.executeCommand(getFullCommand(id), ...args);
    };
}

function getSelections(
    selections?: NumberSelection[] | NumberSelection,
): NumberSelection[] {
    if (selections == null) {
        return [[0, 0, 0, 0]];
    }
    if (Array.isArray(selections[0])) {
        return selections as NumberSelection[];
    }
    return [selections as NumberSelection];
}
