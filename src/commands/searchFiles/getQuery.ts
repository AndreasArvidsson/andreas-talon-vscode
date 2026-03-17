import { window } from "vscode";

export async function getQuery(): Promise<string | undefined> {
    const query = await window.showInputBox({
        prompt: "Search query",
        placeHolder: "Search query",
        ignoreFocusOut: true,
        validateInput: (value) => {
            if (value.trim()) {
                return null;
            }
            return "Can't be empty";
        },
    });
    return query ? query.trim() : undefined;
}
