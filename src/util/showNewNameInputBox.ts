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
        validateInput: (input) => {
            if (input.trim().length > 0) {
                return null;
            }
            return "Can't be empty";
        },
    });
    return filename != null ? filename.trim() : undefined;
}
