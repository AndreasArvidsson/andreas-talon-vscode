import * as vscode from "vscode";

export async function printCommands(): Promise<void> {
    const commands = (await vscode.commands.getCommands()).filter((c) => !c.startsWith("_")).sort();

    commands.forEach((c) => {
        console.log(c);
    });
}
