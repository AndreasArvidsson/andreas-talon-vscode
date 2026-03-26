import * as vscode from "vscode";

export async function executeCommands(commands: string[]): Promise<unknown[]> {
    const results: unknown[] = [];

    for (const command of commands) {
        // oxlint-disable-next-line no-await-in-loop
        results.push(await vscode.commands.executeCommand(command));
    }

    return results;
}
