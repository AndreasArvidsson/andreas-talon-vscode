import { window } from "vscode";

async function update(increment: boolean, value?: number) {
    const editor = window.activeTextEditor;

    if (!editor) {
        return;
    }

    await editor.edit((editBuilder) => {
        editor.selections.forEach((selection) => {
            const selectionText = editor.document.getText(selection);

            const updatedText = selectionText.replace(/-?\d+(\.\d+)?/g, (text) =>
                text.includes(".")
                    ? updateFloat(increment, text, value).toString()
                    : updateInteger(increment, text, value).toString()
            );

            if (selectionText !== updatedText) {
                editBuilder.replace(selection, updatedText);
            }
        });
    });
}

function updateInteger(increment: boolean, text: string, value?: number): number {
    const original = parseInt(text);
    const diff = value ?? 1;
    return original + (increment ? diff : -diff);
}

function updateFloat(increment: boolean, text: string, value?: number): number {
    const original = parseFloat(text);
    const isPercentage = Math.abs(original) <= 1.0;
    const diff = value ?? (isPercentage ? 0.1 : 1);
    const updated = original + (increment ? diff : -diff);
    // Remove precision problems that would add a lot of extra digits
    return parseFloat(updated.toPrecision(15)) / 1;
}

export function increment(value?: number): Promise<void> {
    return update(true, value);
}

export function decrement(value?: number): Promise<void> {
    return update(false, value);
}
