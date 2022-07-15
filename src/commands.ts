import * as vscode from "vscode";

export async function executeCommands(commands: string[]) {
    for (const command of commands) {
        await vscode.commands.executeCommand(command);
    }
}

export async function printCommands() {
    let commandList = await vscode.commands.getCommands();
    commandList = commandList.filter((c) => !c.startsWith("_"));
    commandList.sort();
    commandList.forEach((c) => {
        console.log(c);
    });
}
