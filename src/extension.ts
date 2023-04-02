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

        return vscode.commands.registerCommand(fullCommand, async (...args: unknown[]) => {
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
        registerCommand("getFilename", getFilename),
        registerCommand("copyFilename", copyFilename),
        registerCommand("newFile", newFile),
        registerCommand("duplicateFile", duplicateFile),
        registerCommand("renameFile", renameFile),
        registerCommand("removeFile", removeFile),
        registerCommand("moveFile", moveFile),
        // Edits
        registerCommand("generateRange", generateRange),
        registerCommand("increment", increment),
        registerCommand("decrement", decrement),
        // Navigation
        registerCommand("openEditorAtIndex", openEditorAtIndex),
        registerCommand("selectTo", selectTo),
        registerCommand("lineMiddle", lineMiddle),
        // Git
        registerCommand("getGitFileURL", git.getFileURL),
        registerCommand("getGitRepoURL", git.getRepoURL),
        registerCommand("getGitIssuesURL", git.getIssuesURL),
        registerCommand("getGitNewIssueURL", git.getNewIssueURL),
        registerCommand("getGitPullRequestsURL", git.getPullRequestsURL),
        // Other
        registerCommand("getSelectedText", getSelectedText),
        registerCommand("getClassName", className.get),
        registerCommand("getDictationContext", getDictationContext),
        registerCommand("executeCommands", executeCommands),
        registerCommand("printCommands", printCommands)
    );
};
