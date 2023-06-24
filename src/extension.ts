import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";
import { registerLanguageDefinitions } from "./registerLanguageDefinitions";
import { registerLanguageFormatter } from "./registerLanguageFormatter";
import { getGitExtension, getParseTreeExtension } from "./util/getExtension";

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
    const parseTreeExtension = await getParseTreeExtension();
    const gitExtension = await getGitExtension();

    context.subscriptions.push(
        ...registerCommands(parseTreeExtension, gitExtension),
        registerLanguageDefinitions(),
        registerLanguageFormatter()
    );
};
