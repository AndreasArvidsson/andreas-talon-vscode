import { window, commands } from "vscode";

export const openEditorAtIndex = async (index: number): Promise<void> => {
    // Negative index starts from the back
    if (index < 0) {
        index += window.tabGroups.activeTabGroup.tabs.length;
    }
    await commands.executeCommand("workbench.action.openEditorAtIndex", index);
};
