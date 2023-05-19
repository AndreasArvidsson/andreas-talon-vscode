import * as vscode from "vscode";
import { getFullCommand } from "../util/getFullCommand";
import { CommandIds } from "./commands";
import { executeCommands } from "./executeCommands";
import { copyFilename } from "./files/copyFilename";
import { duplicateFile } from "./files/duplicateFile";
import { getFilename } from "./files/getFilename";
import { moveFile } from "./files/moveFile";
import { newFile } from "./files/newFile";
import { removeFile } from "./files/removeFile";
import { renameFile } from "./files/renameFile";
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
import { getSetting, setSetting } from "./settings";

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
        getSetting,
        setSetting,
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
