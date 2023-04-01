import * as vscode from "vscode";
import { executeCommands } from "./commands/executeCommands";
import { copyFilename } from "./commands/files/copyFilename";
import { duplicateFile } from "./commands/files/duplicateFile";
import { getFilename } from "./commands/files/getFilename";
import { moveFile } from "./commands/files/moveFile";
import { newFile } from "./commands/files/newFile";
import { removeFile } from "./commands/files/removeFile";
import { renameFile } from "./commands/files/renameFile";
import { generateRange } from "./commands/generateRange";
import * as className from "./commands/getClassName";
import { getDictationContext } from "./commands/getDictationContext";
import { getSelectedText } from "./commands/getSelectedText";
import * as git from "./commands/git";
import { decrement, increment } from "./commands/incrementDecrement";
import { lineMiddle } from "./commands/lineMiddle";
import { openEditorAtIndex } from "./commands/openEditorAtIndex";
import { printCommands } from "./commands/printCommands";
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
        // Files
        registerCommand("copyFilename", copyFilename),
        registerCommand("duplicateFile", duplicateFile),
        registerCommand("getFilename", getFilename),
        registerCommand("moveFile", moveFile),
        registerCommand("newFile", newFile),
        registerCommand("removeFile", removeFile),
        registerCommand("renameFile", renameFile),
        // Navigation
        registerCommand("selectTo", selectTo),
        registerCommand("lineMiddle", lineMiddle),
        registerCommand("openEditorAtIndex", openEditorAtIndex),
        // Edits
        registerCommand("generateRange", generateRange),
        registerCommand("increment", increment),
        registerCommand("decrement", decrement),
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
