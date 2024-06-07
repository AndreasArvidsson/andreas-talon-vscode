import * as vscode from "vscode";
import { isTesting } from "./isTesting";

interface Configuration {
    talonFormatter: {
        columnWidth: () => number | null;
    };
}

export const configuration: Configuration = (() => {
    if (isTesting) {
        return {
            talonFormatter: {
                columnWidth: () => 28
            }
        };
    }

    return {
        talonFormatter: {
            columnWidth: () => getConfiguration<number>("talonFormatter.columnWidth") ?? null
        }
    };
})();

function getConfiguration<T>(key: string) {
    return vscode.workspace.getConfiguration("andreas").get<T>(key);
}
