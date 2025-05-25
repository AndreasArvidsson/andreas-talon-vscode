import { ViewColumn, commands } from "vscode";

export function focusViewColumn(viewColumn: ViewColumn) {
    const command = columnFocusCommands[viewColumn];

    if (command == null) {
        throw Error(`Unsupported view column '${viewColumn}'`);
    }

    return commands.executeCommand(command);
}

const columnFocusCommands = {
    [ViewColumn.One]: "workbench.action.focusFirstEditorGroup",
    [ViewColumn.Two]: "workbench.action.focusSecondEditorGroup",
    [ViewColumn.Three]: "workbench.action.focusThirdEditorGroup",
    [ViewColumn.Four]: "workbench.action.focusFourthEditorGroup",
    [ViewColumn.Five]: "workbench.action.focusFifthEditorGroup",
    [ViewColumn.Six]: "workbench.action.focusSixthEditorGroup",
    [ViewColumn.Seven]: "workbench.action.focusSeventhEditorGroup",
    [ViewColumn.Eight]: "workbench.action.focusEighthEditorGroup",
    [ViewColumn.Nine]: "workbench.action.focusNinthEditorGroup",
    [ViewColumn.Active]: undefined,
    [ViewColumn.Beside]: undefined,
};
