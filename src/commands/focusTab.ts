import { commands, window } from "vscode";
import { focusViewColumn } from "../util/focusViewColumn";

export async function focusTab(hint: string): Promise<void> {
    console.log(hint);
    let index = hintToIndex(hint);
    index = await focusTabGroup(index);

    await commands.executeCommand("workbench.action.openEditorAtIndex", index);
}

function hintToIndex(hint: string): number {
    const ref = "a".charCodeAt(0);
    const letters = hint.toLowerCase().split("").reverse();
    let result = 0;

    letters.forEach((letter, index) => {
        const value = letter.charCodeAt(0) - ref;
        result += value + (value + 1) * 26 * index;
    });

    return result;
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
