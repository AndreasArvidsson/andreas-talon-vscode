import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";
import { registerLanguageCodeActions } from "./language/registerLanguageCodeActions";
import { registerLanguageCompletionProviders } from "./language/registerLanguageCompletionProviders";
import { registerLanguageDefinitions } from "./language/registerLanguageDefinitions";
import { registerLanguageFormatters } from "./language/registerLanguageFormatters";
import { registerStateUpdater } from "./stateUpdater";
import { createTabView } from "./tabView";
import { TreeSitter } from "./treeSitter/TreeSitter";
import {
    getCommandServerExtension,
    getGitExtension,
    getParseTreeExtension
} from "./util/getExtension";
import { getFakeCommandServerExtension } from "./util/getFakeCommandServerExtension";
import { isTesting } from "./util/isTesting";

export async function activate(context: vscode.ExtensionContext): Promise<void> {
    try {
        await activateExtension(context);
    } catch (error) {
        void vscode.window.showErrorMessage((error as Error).message);
        throw error;
    }
}

async function activateExtension(context: vscode.ExtensionContext): Promise<void> {
    if (isTesting) {
        console.log("Running extension in test mode");
    }

    const parseTreeExtension = await getParseTreeExtension();
    const gitExtension = await getGitExtension();
    const commandServerExtension = isTesting
        ? getFakeCommandServerExtension()
        : await getCommandServerExtension();
    const treeSitter = new TreeSitter(parseTreeExtension);

    if (isTesting) {
        console.debug = () => {
            // The parse tree extensions spams debug logs
        };
    }

    context.subscriptions.push(
        registerCommands(commandServerExtension, gitExtension, treeSitter),
        registerLanguageDefinitions(),
        registerLanguageCompletionProviders(),
        registerLanguageCodeActions(treeSitter),
        registerLanguageFormatters(treeSitter),
        createTabView(),
        isTesting ? vscode.Disposable.from() : registerStateUpdater()
    );
}
