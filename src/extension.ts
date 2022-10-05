import { commands, ExtensionContext, extensions, window } from "vscode";
import { executeCommands, printCommands } from "./commands";
import { getDictationContext } from "./dictation";
import { getFilename } from "./files";
import generateRange from "./generateRange";
import getClassName from "./getClassName";
import getSelectedText from "./getSelectedText";
import git from "./git";
import lineMiddle from "./lineMiddle";
import { decrement, increment } from "./numbers";
import { registerLanguageDefinitions } from "./registerLanguageDefinitions";
import { registerLanguageFormatter } from "./registerLanguageFormatter";
import selectTo from "./selectTo";
import { openEditorAtIndex } from "./tabs";
import undoUntilNotDirty from "./undoUntilNotDirty";

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
        const fullCommand = `andreas.${command}`;
        return commands.registerCommand(fullCommand, (...args: any[]) => {
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
        registerLanguageDefinitions(),
        registerLanguageFormatter(),
        registerCommand("selectTo", selectTo),
        registerCommand("lineMiddle", lineMiddle),
        registerCommand("executeCommands", executeCommands),
        registerCommand("printCommands", printCommands),
        registerCommand("getSelectedText", getSelectedText),
        registerCommand("getDictationContext", getDictationContext),
        registerCommand("increment", increment),
        registerCommand("decrement", decrement),
        registerCommand("openEditorAtIndex", openEditorAtIndex),
        registerCommand("getFileName", getFilename),
        registerCommand("undoUntilNotDirty", undoUntilNotDirty),
        registerCommand("generateRange", generateRange),
        registerCommand("getClassName", () => getClassName(getNodeAtLocation)),
        registerCommand("getGitURL", (lineNumber: boolean) =>
            git.getURL(gitExtension, lineNumber)
        )
    );
};

export const deactivate = () => {};
