import { window } from "vscode";

export async function showNewNameInputBox(
    suggestedName: string,
    suggestedExt: string
): Promise<string | undefined> {
    const filename = await window.showInputBox({
        prompt: "New name",
        value: `${suggestedName}${suggestedExt}`,
        valueSelection: [0, suggestedName.length],
        ignoreFocusOut: true
    });
    return filename ? filename.trim() : undefined;
}
