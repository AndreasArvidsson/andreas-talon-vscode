import { TabGroup, commands, window } from "vscode";
import { focusViewColumn } from "../util/focusViewColumn";
import { hintToIndex } from "../util/hints";

export async function focusTab(hint: string): Promise<void> {
    const index = hintToIndex(hint);
    const tabInfo = getTabInfo(index);

    if (tabInfo == null) {
        throw Error(`Can't focus non-existing tab '${hint.toUpperCase()}' at index '${index}'`);
    }

    if (!tabInfo.group.isActive) {
        await focusViewColumn(tabInfo.group.viewColumn);
    }

    await commands.executeCommand("workbench.action.openEditorAtIndex", tabInfo.index);
}

function getTabInfo(index: number): { group: TabGroup; index: number } | null {
    let groupIndex = 0;

    for (const group of window.tabGroups.all) {
        if (index < groupIndex + group.tabs.length) {
            return { group, index: index - groupIndex };
        }
        groupIndex += group.tabs.length;
    }

    return null;
}
