import { commands, window } from "vscode";

export async function openEditorAtIndex(index?: number): Promise<void> {
    let indexToOpen = index;

    if (indexToOpen == null) {
        indexToOpen = await showInputBox();
        if (indexToOpen == null) {
            console.warn("Can't open editor: Missing index argument.");
            return;
        }
    }

    // Negative indices starts from the back
    if (indexToOpen < 0) {
        indexToOpen += window.tabGroups.activeTabGroup.tabs.length;
    }

    await commands.executeCommand(
        "workbench.action.openEditorAtIndex",
        indexToOpen,
    );
}

async function showInputBox(): Promise<number | undefined> {
    const value = await window.showInputBox({
        placeHolder: "Editor index (0 offset)",
        ignoreFocusOut: true,
        validateInput: (input) => {
            if (/^-?\d+$/.test(input.trim())) {
                return null;
            }
            return "Must be integer";
        },
    });
    if (value != null) {
        return Number.parseInt(value.trim(), 10);
    }
    return undefined;
}
