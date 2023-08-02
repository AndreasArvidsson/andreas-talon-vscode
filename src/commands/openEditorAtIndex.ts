import { window, commands } from "vscode";

export function openEditorAtIndex(index: number): Thenable<void> {
    // Negative index starts from the back
    if (index < 0) {
        index += window.tabGroups.activeTabGroup.tabs.length;
    }

    return commands.executeCommand("workbench.action.openEditorAtIndex", index);
}
