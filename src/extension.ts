import {
    ExtensionContext,
    extensions,
    commands,
    Disposable,
    window,
} from "vscode";
import selectTo from "./selectTo";
import lineMiddle from "./lineMiddle";
import formatDocument from "./formatDocument";
import constructorName from "./constructorName";
import { executeCommands, printCommands } from "./commands";
import getSelectedText from "./getSelectedText";
import { increment, decrement } from "./numbers";
import git from "./git";
import { openEditorAtIndex } from "./tabs";

export const activate = async (context: ExtensionContext) => {
    const parseTreeExtension = extensions.getExtension("pokey.parse-tree");
    if (!parseTreeExtension) {
        throw Error("Depends on pokey.parse-tree extension");
    }
    const gitExtension = extensions.getExtension("vscode.git")?.exports;
    if (!gitExtension) {
        throw Error("Depends on vscode.git extension");
    }
    const { getNodeAtLocation } = await parseTreeExtension.activate();

    const registerCommand = (
        command: string,
        callback: (...args: any[]) => any
    ) => {
        return commands.registerCommand(command, (...args: any[]) => {
            try {
                return callback(...args);
            } catch (ex) {
                const err = ex as Error;
                window.showErrorMessage(err.message);
                console.error(err.stack);
            }
        });
    };

    context.subscriptions.push(
        registerCommand("andreas.selectTo", selectTo),
        registerCommand("andreas.lineMiddle", lineMiddle),
        registerCommand("andreas.formatDocument", formatDocument),
        registerCommand("andreas.executeCommands", executeCommands),
        registerCommand("andreas.printCommands", printCommands),
        registerCommand("andreas.getSelectedText", getSelectedText),
        registerCommand("andreas.increment", increment),
        registerCommand("andreas.decrement", decrement),
        registerCommand("andreas.constructorName", () =>
            constructorName(getNodeAtLocation)
        ),
        registerCommand("andreas.git.getURL", (lineNumber: boolean) =>
            git.getURL(gitExtension, lineNumber)
        ),
        registerCommand("andreas.openEditorAtIndex", openEditorAtIndex)
    );
};

export const deactivate = () => {};
