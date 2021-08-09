import { ExtensionContext, extensions, commands } from "vscode";
import selectTo from "./selectTo";
import lineMiddle from "./lineMiddle";
import formatDocument from "./formatDocument";
import constructorName from "./constructorName";

export const activate = async (context: ExtensionContext) => {
    const parseTreeExtension = extensions.getExtension("pokey.parse-tree");
    if (!parseTreeExtension) {
        throw new Error("Depends on pokey.parse-tree extension");
    }
    const { getNodeAtLocation } = await parseTreeExtension.activate();

    context.subscriptions.push(
        commands.registerCommand("andreas.selectTo", selectTo),
        commands.registerCommand("andreas.lineMiddle", lineMiddle),
        commands.registerCommand("andreas.formatDocument", formatDocument),
        commands.registerCommand("andreas.constructorName", () =>
            constructorName(getNodeAtLocation)
        )
    );
};

export const deactivate = () => {};
