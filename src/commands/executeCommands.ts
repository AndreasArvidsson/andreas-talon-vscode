import * as vscode from "vscode";

export async function executeCommands(commands: string[]): Promise<unknown[]> {
    const results: unknown[] = [];

    for (const command of commands) {
        results.push(await vscode.commands.executeCommand(command));
    }

    return results;
}
