import { workspace, type TextDocument } from "vscode";
import { isTesting } from "./isTesting";

interface Configuration {
    talonFormatter: {
        columnWidth: (document: TextDocument) => number | undefined;
    };
    talonListFormatter: {
        columnWidth: (document: TextDocument) => number | undefined;
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
            columnWidth: (document: TextDocument) => {
                return getConfiguration<number>(
                    document,
                    "talonFormatter.columnWidth",
                );
            },
        },
        talonListFormatter: {
            columnWidth: (document: TextDocument) => {
                return getConfiguration<number>(
                    document,
                    "talonListFormatter.columnWidth",
                );
            },
        },
    };
})();

function getConfiguration<T>(
    document: TextDocument,
    key: string,
): T | undefined {
    return workspace.getConfiguration("andreas", document).get<T>(key);
}
