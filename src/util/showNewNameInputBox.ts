import { window } from "vscode";

export async function showNewNameInputBox(
    suggestedName: string,
    suggestedExt: string,
): Promise<string | undefined> {
    const filename = await window.showInputBox({
        prompt: "New name",
        placeHolder: "New name",
        value: `${suggestedName}${suggestedExt}`,
        valueSelection: [0, suggestedName.length],
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (value.trim()) {
                return null;
            }
            return "Can't be empty";
        },
    });
    return filename ? filename.trim() : undefined;
}
