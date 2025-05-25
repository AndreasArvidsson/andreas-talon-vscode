import { commands, window } from "vscode";

export async function openEditorAtIndex(index?: number): Promise<void> {
    if (index == null) {
        index = await showInputBox();
        if (index == null) {
            console.warn("Can't open editor: Missing index argument.");
            return;
        }
    }

    // Negative indices starts from the back
    if (index < 0) {
        index += window.tabGroups.activeTabGroup.tabs.length;
    }

    await commands.executeCommand("workbench.action.openEditorAtIndex", index);
}

async function showInputBox(): Promise<number | undefined> {
    const value = await window.showInputBox({
        placeHolder: "Editor index (0 offset)",
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (/^-?\d+$/.test(value.trim())) {
                return null;
            }
            return "Must be integer";
        },
    });
    if (value != null) {
        return parseInt(value.trim());
    }
    return undefined;
}
