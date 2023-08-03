import { commands, window } from "vscode";
import { focusViewColumn } from "../util/focusViewColumn";
import { hintToIndex } from "../util/hints";

export async function focusTab(hint: string): Promise<void> {
    const index = hintToIndex(hint);
    const indexInGroup = await focusTabGroup(index);

    await commands.executeCommand("workbench.action.openEditorAtIndex", indexInGroup);
}

async function focusTabGroup(index: number): Promise<number> {
    const tabGroups = window.tabGroups.all;

    let groupIndex = 0;

    for (const group of tabGroups) {
        if (index < groupIndex + group.tabs.length) {
            if (!group.isActive) {
                await focusViewColumn(group.viewColumn);
            }
            return index - groupIndex;
        }
        groupIndex += group.tabs.length;
    }

    throw Error(`Can't focus non-existing tab at index ${index}`);
}
