import * as vscode from "vscode";
import { classNameInit } from "./commands/getClassName";
import { gitInit } from "./commands/git";
import { registerCommands } from "./commands/registerCommands";
import { registerLanguageDefinitions } from "./registerLanguageDefinitions";
import { registerLanguageFormatter } from "./registerLanguageFormatter";
import { registerLanguageHovers } from "./registerLanguageHovers";
import { getGitExtension, getParseTreeExtension } from "./util/getExtension";

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
    const parseTreeExtension = await getParseTreeExtension();
    const gitExtension = await getGitExtension();
    classNameInit(parseTreeExtension);
    gitInit(gitExtension);

    context.subscriptions.push(
        ...registerCommands(),
        registerLanguageDefinitions(),
        registerLanguageHovers(),
        registerLanguageFormatter()
    );
};
