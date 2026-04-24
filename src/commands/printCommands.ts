import * as vscode from "vscode";

export async function printCommands(): Promise<void> {
    const commands = await vscode.commands.getCommands();

    for (const command of commands
        .filter((c) => !c.startsWith("_"))
        .toSorted()) {
        console.log(command);
    }
}
