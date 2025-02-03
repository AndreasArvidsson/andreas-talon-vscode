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
            return getMyConfiguration<boolean>(document, "formatCommentsOnSave") ?? false;
        },
        talonFormatter: {
            columnWidth: (document) => {
                return getMyConfiguration<number>(document, "talonFormatter.columnWidth");
            }
        },
        talonListFormatter: {
            columnWidth: (document) => {
                return getMyConfiguration<number>(document, "talonListFormatter.columnWidth");
            }
        }
    };
})();

function getMyConfiguration<T>(document: TextDocument, key: string): T | undefined {
    return getConfiguration(document, "andreas", key);
}

export function getConfiguration<T>(
    document: TextDocument,
    section: string,
    key: string
): T | undefined {
    return (
        getLanguageConfiguration(document, section, key) ??
        workspace.getConfiguration(section).get<T>(key)
    );
}

function getLanguageConfiguration<T>(
    document: TextDocument,
    section: string,
    key: string
): T | undefined {
    const langConfig = workspace.getConfiguration(`[${document.languageId}]`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (langConfig as any)[`${section}.${key}`];
}
