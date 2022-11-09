import * as vscode from "vscode";

export default async (commands: string[]): Promise<void> => {
    for (const command of commands) {
        await vscode.commands.executeCommand(command);
    }
};
