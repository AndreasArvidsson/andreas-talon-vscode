import * as vscode from "vscode";

export async function printCommands(): Promise<void> {
    const commands = await vscode.commands.getCommands();

    commands
        .filter((c) => !c.startsWith("_"))
        .toSorted()
        .forEach((c) => {
            console.log(c);
        });
}
