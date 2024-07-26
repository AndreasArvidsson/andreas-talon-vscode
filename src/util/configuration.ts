import * as vscode from "vscode";
import { isTesting } from "./isTesting";

interface Configuration {
    talonFormatter: {
        columnWidth: () => number | undefined;
    };
    talonListFormatter: {
        columnWidth: () => number | undefined;
    };
}

export const configuration: Configuration = (() => {
    if (isTesting) {
        return {
            talonFormatter: {
                columnWidth: () => 28
            },
            talonListFormatter: {
                columnWidth: () => 10
            }
        };
    }

    return {
        talonFormatter: {
            columnWidth: () => getConfiguration<number>("talonFormatter.columnWidth") ?? undefined
        },
        talonListFormatter: {
            columnWidth: () =>
                getConfiguration<number>("talonListFormatter.columnWidth") ?? undefined
        }
    };
})();

function getConfiguration<T>(key: string) {
    return vscode.workspace.getConfiguration("andreas").get<T>(key);
}
