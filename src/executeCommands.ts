import { commands } from "vscode";

interface Args {
    commands: string[];
}

export default async (args: Args) => {
    for (const command of args.commands) {
        await commands.executeCommand(command);
    }
};
