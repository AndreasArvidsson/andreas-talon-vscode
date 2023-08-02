import { commands, window } from "vscode";
import { focusViewColumn } from "../util/focusViewColumn";

export async function openEditorAtIndex(index: number): Promise<void> {
    // Indices larger then the active tab group looks in other groups
    if (index >= window.tabGroups.activeTabGroup.tabs.length) {
        index = await focusTabGroup(index);
    }

    // Negative indices starts from the back in the active tab group
    else if (index < 0) {
        index += window.tabGroups.activeTabGroup.tabs.length;
    }

    return commands.executeCommand("workbench.action.openEditorAtIndex", index);
}

async function focusTabGroup(index: number): Promise<number> {
    const tabGroups = [...window.tabGroups.all];
    tabGroups.sort((a) => (a.isActive ? -1 : 0));

    let groupIndex = 0;

    for (const group of tabGroups) {
        if (index < groupIndex + group.tabs.length) {
            await focusViewColumn(group.viewColumn);
            return index - groupIndex;
        }
        groupIndex += group.tabs.length;
    }

    throw Error(`Can't focus non-existing tab at index ${index}`);
}
