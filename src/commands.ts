import { commands } from "vscode";

interface Args {
    commands: string[];
}

export async function executeCommands(args: Args) {
    for (const command of args.commands) {
        await commands.executeCommand(command);
    }
}

export async function printCommands() {
    let commandList = await commands.getCommands();
    commandList = commandList.filter((c) => !c.startsWith("_"));
    commandList.sort();
    commandList.forEach((c) => {
        console.log(c);
    });
}
