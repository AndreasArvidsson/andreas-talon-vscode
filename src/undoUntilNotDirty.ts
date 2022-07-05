import { commands, window } from "vscode";

export default async () => {
    const document = window.activeTextEditor?.document;
    while (document?.isDirty) {
        await commands.executeCommand("undo");
    }
};
