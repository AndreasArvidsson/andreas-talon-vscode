import { workspace } from "vscode";
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
                columnWidth: () => 28,
            },
            talonListFormatter: {
                columnWidth: () => 10,
            },
        };
    }

    return {
        talonFormatter: {
            columnWidth: () => {
                return getConfiguration<number>("talonFormatter.columnWidth");
            },
        },
        talonListFormatter: {
            columnWidth: () => {
                return getConfiguration<number>("talonListFormatter.columnWidth");
            },
        },
    };
})();

function getConfiguration<T>(key: string): T | undefined {
    return workspace.getConfiguration("andreas").get<T>(key);
}
