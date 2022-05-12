import { window, commands } from "vscode";

export const openEditorAtIndex = async (index: number) => {
    // Negative index starts from the back
    if (index < 0) {
        const numTabs: number = window.tabGroups.activeTabGroup.tabs.length;
        index += numTabs;
    }
    await commands.executeCommand("workbench.action.openEditorAtIndex", index);
};
