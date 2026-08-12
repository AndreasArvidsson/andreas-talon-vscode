import { getActiveEditor } from "../util/getActiveEditor";

async function update(inc: boolean, value?: number): Promise<void> {
    const editor = getActiveEditor();

    await editor.edit((editBuilder) => {
        for (const selection of editor.selections) {
            const selectionText = editor.document.getText(selection);

            const updatedText = selectionText.replaceAll(
                /-?\d+(\.\d+)?/gu,
                (text) =>
                    text.includes(".")
                        ? updateFloat(inc, text, value).toString()
                        : updateInteger(inc, text, value).toString(),
            );

            if (selectionText !== updatedText) {
                editBuilder.replace(selection, updatedText);
            }
        }
    });
}

function updateInteger(inc: boolean, text: string, value?: number): number {
    const original = Math.trunc(Number(text));
    const diff = value ?? 1;
    return original + (inc ? diff : -diff);
}

function updateFloat(inc: boolean, text: string, value?: number): number {
    const original = Number(text);
    const isPercentage = Math.abs(original) <= 1;
    const diff = value ?? (isPercentage ? 0.1 : 1);
    const updated = original + (inc ? diff : -diff);
    // Remove precision problems that would add a lot of extra digits
    return Number(updated.toPrecision(15)) / 1;
}

export function increment(value?: number): Promise<void> {
    return update(true, value);
}

export function decrement(value?: number): Promise<void> {
    return update(false, value);
}
