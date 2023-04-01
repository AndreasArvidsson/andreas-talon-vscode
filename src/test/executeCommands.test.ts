import { getFullCommand } from "../util/getFullCommand";
import { runTest } from "./testUtil/runTest";

const command = "executeCommands";

suite(command, () => {
    runTest({
        title: command,
        command: {
            id: command,
            args: [
                [
                    "editor.action.insertLineAfter",
                    "editor.action.insertLineAfter",
                    getFullCommand("getFilename")
                ]
            ]
        },
        pre: {
            content: ""
        },
        post: {
            content: "\n\n",
            selections: [2, 0],
            returnValue: [undefined, undefined, "Untitled-1"]
        }
    });
});
