import { getActiveEditor } from "../util/getActiveEditor";

async function update(inc: boolean, value?: number) {
    const editor = getActiveEditor();

    await editor.edit((editBuilder) => {
        editor.selections.forEach((selection) => {
            const selectionText = editor.document.getText(selection);

            const updatedText = selectionText.replaceAll(
                /-?\d+(\.\d+)?/g,
                (text) =>
                    text.includes(".")
                        ? updateFloat(inc, text, value).toString()
                        : updateInteger(inc, text, value).toString(),
            );

            if (selectionText !== updatedText) {
                editBuilder.replace(selection, updatedText);
            }
        });
    });
}

function updateInteger(inc: boolean, text: string, value?: number): number {
    const original = parseInt(text, 10);
    const diff = value ?? 1;
    return original + (inc ? diff : -diff);
}

function updateFloat(inc: boolean, text: string, value?: number): number {
    const original = parseFloat(text);
    const isPercentage = Math.abs(original) <= 1.0;
    const diff = value ?? (isPercentage ? 0.1 : 1);
    const updated = original + (inc ? diff : -diff);
    // Remove precision problems that would add a lot of extra digits
    return parseFloat(updated.toPrecision(15)) / 1;
}

export function increment(value?: number): Promise<void> {
    return update(true, value);
}

export function decrement(value?: number): Promise<void> {
    return update(false, value);
}
