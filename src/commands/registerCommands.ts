import * as vscode from "vscode";
import type { TreeSitter } from "../treeSitter/TreeSitter";
import type { CommandServerExtension } from "../typings/commandServer";
import type { GitExtension } from "../typings/git";
import { getFullCommand } from "../util/getFullCommand";
import { GetText } from "./GetText";
import { GitParameters, GitUtil } from "./GitUtil";
import { CommandId } from "./commands";
import { executeCommands } from "./executeCommands";
import { copyFilename } from "./files/copyFilename";
import { duplicateFile } from "./files/duplicateFile";
import { getFilename } from "./files/getFilename";
import { moveFile } from "./files/moveFile";
import { newFile } from "./files/newFile";
import { removeFile } from "./files/removeFile";
import { renameFile } from "./files/renameFile";
import { focusTab } from "./focusTab";
import { formatSelectedFiles, formatWorkspaceFiles } from "./formatFiles";
import { generateRange } from "./generateRange";
import { goToLine } from "./goToLine";
import { decrement, increment } from "./incrementDecrement";
import { lineMiddle } from "./lineMiddle";
import { openEditorAtIndex } from "./openEditorAtIndex";
import { printCommands } from "./printCommands";
import { selectTo } from "./selectTo";
import { getSetting, setSetting } from "./settings";

type Callback = (...args: any[]) => any;

export function registerCommands(
    commandServerExtension: CommandServerExtension,
    gitExtension: GitExtension,
    treeSitter: TreeSitter
): vscode.Disposable {
    const getText = new GetText(commandServerExtension, treeSitter);
    const git = new GitUtil(gitExtension);

    const commands: Record<CommandId, Callback> = {
        // Files
        getFilename,
        copyFilename,
        newFile,
        duplicateFile,
        renameFile,
        removeFile,
        moveFile,
        formatWorkspaceFiles,
        formatSelectedFiles,
        // Edits
        generateRange,
        increment,
        decrement,
        // Navigation
        openEditorAtIndex,
        focusTab,
        goToLine,
        selectTo,
        lineMiddle,
        // Text
        getDocumentText: () => getText.getDocumentText(),
        getSelectedText: () => getText.getSelectedText(),
        getDictationContext: () => getText.getDictationContext(),
        getClassName: () => getText.getClassName(),
        getOpenTagName: () => getText.getOpenTagName(),
        // Git
        getGitFileURL: (p: GitParameters) => git.getGitFileURL(p),
        getGitRepoURL: () => git.getGitRepoURL(),
        getGitIssuesURL: () => git.getGitIssuesURL(),
        getGitNewIssueURL: () => git.getGitNewIssueURL(),
        getGitPullRequestsURL: () => git.getGitPullRequestsURL(),
        // Other
        getSetting,
        setSetting,
        executeCommands,
        printCommands
    } as const;

    return vscode.Disposable.from(
        ...Object.entries(commands).map(([command, callback]) =>
            registerCommand(command as CommandId, callback)
        )
    );
}

function registerCommand(command: CommandId, callback: Callback): vscode.Disposable {
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
}
