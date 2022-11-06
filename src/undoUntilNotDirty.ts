import { commands, window } from "vscode";

export default async (): Promise<void> => {
    const document = window.activeTextEditor?.document;

    while (document?.isDirty) {
        await commands.executeCommand("undo");
    }
};
