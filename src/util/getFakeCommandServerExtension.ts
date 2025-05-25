import { CommandServerExtension } from "../typings/commandServer";

export function getFakeCommandServerExtension(): CommandServerExtension {
    return {
        getFocusedElementType: () => Promise.resolve("textEditor"),

        signals: {
            prePhrase: {
                getVersion: () => Promise.resolve(null),
            },
        },
    };
}
