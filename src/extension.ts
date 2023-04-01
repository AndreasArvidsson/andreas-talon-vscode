import * as vscode from "vscode";
import { copyFilename } from "./commands/copyFilename";
import { duplicateFile } from "./commands/duplicateFile";
import { executeCommands } from "./commands/executeCommands";
import { generateRange } from "./commands/generateRange";
import * as className from "./commands/getClassName";
import { getDictationContext } from "./commands/getDictationContext";
import { getFilename } from "./commands/getFilename";
import { getSelectedText } from "./commands/getSelectedText";
import * as git from "./commands/git";
import { decrement, increment } from "./commands/incrementDecrement";
import { lineMiddle } from "./commands/lineMiddle";
import { newFile } from "./commands/newFile";
import { openEditorAtIndex } from "./commands/openEditorAtIndex";
import { printCommands } from "./commands/printCommands";
import { removeFile } from "./commands/removeFile";
import { renameFile } from "./commands/renameFile";
import { selectTo } from "./commands/selectTo";
import { registerLanguageDefinitions } from "./registerLanguageDefinitions";
import { registerLanguageFormatter } from "./registerLanguageFormatter";
import { getGitExtension, getParseTreeExtension } from "./util/getExtension";
import { getFullCommand } from "./util/getFullCommand";

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
    const parseTreeExtension = await getParseTreeExtension();
    const gitExtension = await getGitExtension();
    className.init(parseTreeExtension);
    git.init(gitExtension);

    const registerCommand = (
        command: string,
        callback: (...args: any[]) => any
    ): vscode.Disposable => {
        const fullCommand = getFullCommand(command);

        return vscode.commands.registerCommand(fullCommand, async (...args: any[]) => {
            try {
                return await Promise.resolve<unknown>(callback(...args));
            } catch (ex) {
                const err = ex as Error;
                await vscode.window.showErrorMessage(err.message);
                console.error(err.stack);
            }
        });
    };

    context.subscriptions.push(
        registerLanguageDefinitions(),
        registerLanguageFormatter(),
        // Navigation
        registerCommand("selectTo", selectTo),
        registerCommand("lineMiddle", lineMiddle),
        registerCommand("openEditorAtIndex", openEditorAtIndex),
        // Edits
        registerCommand("generateRange", generateRange),
        registerCommand("increment", increment),
        registerCommand("decrement", decrement),
        // Files
        registerCommand("getFilename", getFilename),
        registerCommand("copyFilename", copyFilename),
        registerCommand("newFile", newFile),
        registerCommand("renameFile", renameFile),
        registerCommand("removeFile", removeFile),
        registerCommand("duplicateFile", duplicateFile),
        // moveFile
        // Git
        registerCommand("getGitRepoURL", git.getRepoURL),
        registerCommand("getGitFileURL", git.getFileURL),
        registerCommand("getGitIssuesURL", git.getIssuesURL),
        registerCommand("getGitNewIssueURL", git.getNewIssueURL),
        registerCommand("getGitPullRequestsURL", git.getPullRequestsURL),
        // Commands
        registerCommand("executeCommands", executeCommands),
        registerCommand("printCommands", printCommands),
        // Misc
        registerCommand("getSelectedText", getSelectedText),
        registerCommand("getDictationContext", getDictationContext),
        registerCommand("getClassName", className.get)
    );
};
