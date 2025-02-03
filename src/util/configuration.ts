import type { TextDocument } from "vscode";
import { workspace } from "vscode";
import { isTesting } from "./isTesting";

interface Configuration {
    formatCommentsOnSave: (document: TextDocument) => boolean;
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
            formatCommentsOnSave: () => false,
            talonFormatter: {
                columnWidth: () => 28
            },
            talonListFormatter: {
                columnWidth: () => 10
            }
        };
    }

    return {
        formatCommentsOnSave: (document) => {
            return getConfiguration<boolean>(document, "formatCommentsOnSave") ?? false;
        },
        talonFormatter: {
            columnWidth: (document) => {
                return getConfiguration<number>(document, "talonFormatter.columnWidth");
            }
        },
        talonListFormatter: {
            columnWidth: (document) => {
                return getConfiguration<number>(document, "talonListFormatter.columnWidth");
            }
        }
    };
})();

function getConfiguration<T>(document: TextDocument, key: string): T | undefined {
    return (
        getLanguageConfiguration(document, key) ?? workspace.getConfiguration("andreas").get<T>(key)
    );
}

function getLanguageConfiguration<T>(document: TextDocument, key: string): T | undefined {
    const langConfig = workspace.getConfiguration(`[${document.languageId}]`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (langConfig as any)[`andreas.${key}`];
}
