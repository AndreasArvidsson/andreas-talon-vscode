import * as vscode from "vscode";

export async function executeCommands(commands: string[]): Promise<void> {
    for (const command of commands) {
        await vscode.commands.executeCommand(command);
    }
}

export async function printCommands(): Promise<void> {
    const commandList = (await vscode.commands.getCommands()).filter(
        (c) => !c.startsWith("_")
    );
    commandList.sort();
    commandList.forEach((c) => {
        console.log(c);
    });
}
