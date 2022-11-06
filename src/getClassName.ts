import { Location, window } from "vscode";
import { GetNodeAtLocation } from "./typings/parserTree";

type ParseTreeExtension = {
    getNodeAtLocation: GetNodeAtLocation;
};

let getNodeAtLocation: GetNodeAtLocation;

export const init = (parseTreeExtension: ParseTreeExtension): void => {
    getNodeAtLocation = parseTreeExtension.getNodeAtLocation;
};

export const get = (): string | null => {
    const editor = window.activeTextEditor;
    if (!editor) {
        return null;
    }

    try {
        const pos = editor.selection.active;
        const location = new Location(editor.document.uri, pos);
        let node = getNodeAtLocation(location);
        while (node.parent != null) {
            if (node.type === "class_declaration") {
                return node.childForFieldName("name")?.text ?? null;
            }
            node = node.parent;
        }
    } catch (error) {
        console.log(error);
    }

    return null;
};
