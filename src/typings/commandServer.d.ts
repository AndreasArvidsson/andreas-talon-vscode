export interface CommandServerExtension {
    getFocusedElementType: () => Promise<FocusedElementType | undefined>;

    signals: {
        prePhrase: {
            getVersion(): Promise<string | null>;
        };
    };
}

export type FocusedElementType = "textEditor" | "terminal";
