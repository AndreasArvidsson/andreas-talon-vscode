import type { TabGroup } from "vscode";
import { commands, window } from "vscode";
import { focusViewColumn } from "../util/focusViewColumn";
import { hintToIndex } from "../util/hints";

export async function focusTab(hintSource?: string): Promise<void> {
    const hint = hintSource ?? (await showInputBox());

    if (hint == null) {
        console.warn("Can't focus tab: Missing hint argument.");
        return;
    }

    const index = hintToIndex(hint);
    const tabInfo = getTabInfo(index);

    if (tabInfo == null) {
        throw new Error(
            `Can't focus non-existing tab '${hint.toUpperCase()}' at index '${index}'`,
        );
    }

    if (!tabInfo.group.isActive) {
        await focusViewColumn(tabInfo.group.viewColumn);
    }

    await commands.executeCommand(
        "workbench.action.openEditorAtIndex",
        tabInfo.index,
    );
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

async function showInputBox(): Promise<string | undefined> {
    const value = await window.showInputBox({
        placeHolder: "Tab hint: [a-zA-Z]{1,2}",
        ignoreFocusOut: true,
        validateInput: (input) => {
            if (/^[a-zA-Z]{1,2}$/.test(input.trim())) {
                return null;
            }
            return "Must be one or two letters: [a-zA-Z]{1,2}";
        },
    });
    if (value != null) {
        return value.trim();
    }
    return undefined;
}
