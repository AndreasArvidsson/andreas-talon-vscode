import { window, commands } from "vscode";
import * as vscode from "vscode";

export const openEditorAtIndex = async (index: number) => {
    // Negative index starts from the back
    if (index < 0) {
        const tabGroups = (window as any).tabGroups;
        const numTabs: number = tabGroups.activeTabGroup.tabs.length;
        index += numTabs;
    }
    await commands.executeCommand("workbench.action.openEditorAtIndex", index);
};
