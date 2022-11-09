import * as vscode from "vscode";
import { executeCommands, printCommands } from "./commands";
import { getDictationContext } from "./dictation";
import { getFilename } from "./files";
import generateRange from "./generateRange";
import * as className from "./getClassName";
import getSelectedText from "./getSelectedText";
import * as git from "./git";
import lineMiddle from "./lineMiddle";
import { decrement, increment } from "./numbers";
import { registerLanguageDefinitions } from "./registerLanguageDefinitions";
import { registerLanguageFormatter } from "./registerLanguageFormatter";
import selectTo from "./selectTo";
import { openEditorAtIndex } from "./tabs";
import { getGitExtension, getParseTreeExtension } from "./util/getExtension";
import getFullCommand from "./util/getFullCommand";

export const activate = async (
    context: vscode.ExtensionContext
): Promise<void> => {
    const parseTreeExtension = await getParseTreeExtension();
    const gitExtension = await getGitExtension();
    className.init(parseTreeExtension);
    git.init(gitExtension);

    const registerCommand = (
        command: string,
        callback: (...args: any[]) => any
    ): vscode.Disposable => {
        const fullCommand = getFullCommand(command);

        return vscode.commands.registerCommand(
            fullCommand,
            (...args: any[]) => {
                try {
                    return callback(...args);
                } catch (ex) {
                    const err = ex as Error;
                    vscode.window.showErrorMessage(err.message);
                    console.error(err.stack);
                }
            }
        );
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
        registerCommand("generateRange", generateRange),
        registerCommand("getClassName", className.get),
        registerCommand("getGitRepoURL", git.getRepoURL),
        registerCommand("getGitFileURL", git.getFileURL),
        registerCommand("getGitIssuesURL", git.getIssuesURL),
        registerCommand("getGitNewIssueURL", git.getNewIssueURL),
        registerCommand("getGitPullRequestsURL", git.getPullRequestsURL)
    );
};
