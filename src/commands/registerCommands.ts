import * as vscode from "vscode";
import { CommandIds } from "./commands";
import { moveFile, renameFile } from "../util/fileSystem";
import { getFullCommand } from "../util/getFullCommand";
import { executeCommands } from "./executeCommands";
import { copyFilename } from "./files/copyFilename";
import { duplicateFile } from "./files/duplicateFile";
import { getFilename } from "./files/getFilename";
import { newFile } from "./files/newFile";
import { removeFile } from "./files/removeFile";
import { generateRange } from "./generateRange";
import { getClassName } from "./getClassName";
import { getDictationContext } from "./getDictationContext";
import { getSelectedText } from "./getSelectedText";
import {
    getGitFileURL,
    getGitIssuesURL,
    getGitNewIssueURL,
    getGitPullRequestsURL,
    getGitRepoURL
} from "./git";
import { decrement, increment } from "./incrementDecrement";
import { lineMiddle } from "./lineMiddle";
import { openEditorAtIndex } from "./openEditorAtIndex";
import { printCommands } from "./printCommands";
import { selectTo } from "./selectTo";

type Callback = (...args: any[]) => any;

export function registerCommands(): vscode.Disposable[] {
    const commands: Record<CommandIds, Callback> = {
        // Files
        getFilename,
        copyFilename,
        newFile,
        duplicateFile,
        renameFile,
        removeFile,
        moveFile,
        // Edits
        generateRange,
        increment,
        decrement,
        // Navigation
        openEditorAtIndex,
        selectTo,
        lineMiddle,
        // Git
        getGitFileURL,
        getGitRepoURL,
        getGitIssuesURL,
        getGitNewIssueURL,
        getGitPullRequestsURL,
        // Other
        getSelectedText,
        getClassName,
        getDictationContext,
        executeCommands,
        printCommands
    };

    return Object.entries(commands).map(([command, callback]) =>
        registerCommand(command, callback)
    );
}

function registerCommand(command: string, callback: Callback): vscode.Disposable {
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
