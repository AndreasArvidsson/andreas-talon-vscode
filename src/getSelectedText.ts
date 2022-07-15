import { window } from "vscode";

export default (): string => {
    const editor = window.activeTextEditor!;
    const selections = [...editor.selections];
    selections.sort((a, b) => a.start.compareTo(b.start));
    return selections
        .map((selection) => editor.document.getText(selection))
        .join("\n");
};
