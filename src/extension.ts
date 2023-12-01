import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";
import { registerLanguageCodeActions } from "./language/registerLanguageCodeActions";
import { registerLanguageDefinitions } from "./language/registerLanguageDefinitions";
import { registerLanguageFormatter } from "./language/registerLanguageFormatter";
import { registerStateUpdater } from "./stateUpdater";
import { createTabView } from "./tabView";
import {
    getCommandServerExtension,
    getGitExtension,
    getParseTreeExtension
} from "./util/getExtension";
import { getFakeCommandServerExtension } from "./util/getFakeCommandServerExtension";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    try {
        await activateExtension(context);
    } catch (error) {
        await vscode.window.showErrorMessage((error as Error).message);
        throw error;
    }
}

async function activateExtension(context: vscode.ExtensionContext): Promise<void> {
    const isTesting = context.extensionMode === vscode.ExtensionMode.Test;
    const parseTreeExtension = await getParseTreeExtension();
    const gitExtension = await getGitExtension();
    const commandServerExtension = isTesting
        ? getFakeCommandServerExtension()
        : await getCommandServerExtension();

    context.subscriptions.push(
        registerCommands(parseTreeExtension, commandServerExtension, gitExtension),
        registerLanguageDefinitions(),
        registerLanguageCodeActions(parseTreeExtension),
        registerLanguageFormatter(parseTreeExtension),
        createTabView(),
        isTesting ? vscode.Disposable.from() : registerStateUpdater()
    );
}
