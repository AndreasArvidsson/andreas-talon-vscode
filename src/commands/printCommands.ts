import * as vscode from "vscode";

export default async (): Promise<void> => {
    const commandList = (await vscode.commands.getCommands()).filter(
        (c) => !c.startsWith("_")
    );
    commandList.sort();
    commandList.forEach((c) => {
        console.log(c);
    });
};
