import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";
import { registerSearchFiles } from "./commands/searchFiles";
import { registerLanguageCodeActions } from "./language/registerLanguageCodeActions";
import { registerLanguageCompletionProviders } from "./language/registerLanguageCompletionProviders";
import { registerLanguageDefinitions } from "./language/registerLanguageDefinitions";
import { registerLanguageFormatters } from "./language/registerLanguageFormatters";
import { createTabView } from "./tabView";
import { TreeSitter } from "./treeSitter/TreeSitter";
import { getErrorMessage } from "./util/getErrorMessage";
import {
    getCommandServerExtension,
    getParseTreeExtension,
} from "./util/getExtension";
import { getFakeCommandServerExtension } from "./util/getFakeCommandServerExtension";
import { isTesting } from "./util/isTesting";

export async function activate(
    context: vscode.ExtensionContext,
): Promise<void> {
    try {
        await activateExtension(context);
    } catch (error) {
        void vscode.window.showErrorMessage(getErrorMessage(error));
        throw error;
    }
}

async function activateExtension(
    context: vscode.ExtensionContext,
): Promise<void> {
    const parseTreeExtension = await getParseTreeExtension();
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
        registerCommands(commandServerExtension, treeSitter),
        registerLanguageDefinitions(),
        registerLanguageCompletionProviders(),
        registerLanguageCodeActions(treeSitter),
        registerLanguageFormatters(context, treeSitter),
        registerSearchFiles(),
        createTabView(),
    );
}
