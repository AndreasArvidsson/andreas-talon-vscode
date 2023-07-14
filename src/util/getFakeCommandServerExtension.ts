import { CommandServerExtension } from "../typings/commandServer";

export function getFakeCommandServerExtension(): CommandServerExtension {
    return {
        getFocusedElementType: () => "textEditor",

        signals: {
            prePhrase: {
                getVersion: () => Promise.resolve(null)
            }
        }
    };
}
