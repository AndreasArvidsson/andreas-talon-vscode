import { window } from "vscode";
import getSortedSelections from "./util/getSortedSelections";

export default (): string => {
    return getSortedSelections()
        .map((selection) =>
            window.activeTextEditor!.document.getText(selection)
        )
        .join("\n");
};
