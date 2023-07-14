export interface CommandServerExtension {
    getFocusedElementType: () => FocusedElementType | undefined;

    signals: {
        prePhrase: {
            getVersion(): Promise<string | null>;
        };
    };
}

export type FocusedElementType = "textEditor" | "terminal";
