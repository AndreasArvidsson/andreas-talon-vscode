import { window } from "vscode";

async function update(increment: boolean) {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }

    await editor.edit((editBuilder) => {
        editor.selections.forEach((selection) => {
            const selectionText = editor.document.getText(selection);
            const updatedText = selectionText.replace(
                /-*(\d+.\d+)|-*\d+/g,
                (text) => {
                    const isFloat = text.includes(".");
                    let numb;
                    if (isFloat) {
                        numb = parseFloat(text);
                        const isPercentage = Math.abs(numb) <= 1.0;
                        if (isPercentage) {
                            numb += increment ? 0.1 : -0.1;
                        } else {
                            numb += increment ? 1 : -1;
                        }
                        // Remove precision problems that would add a lot of extra digits
                        numb = parseFloat(numb.toPrecision(15)) / 1;
                    } else {
                        numb = parseInt(text);
                        numb += increment ? 1 : -1;
                    }
                    return numb.toString();
                }
            );
            if (selectionText !== updatedText) {
                editBuilder.replace(selection, updatedText);
            }
        });
    });
}

export function increment(): void {
    update(true);
}

export function decrement(): void {
    update(false);
}
