import { Location, window } from "vscode";
import { ParseTreeExtension } from "../typings/parserTree";

let parseTree: ParseTreeExtension;

export const init = (parseTreeExtension: ParseTreeExtension): void => {
    parseTree = parseTreeExtension;
};

export const get = (): string | null => {
    const editor = window.activeTextEditor;
    if (!editor) {
        return null;
    }

    try {
        const pos = editor.selection.active;
        const location = new Location(editor.document.uri, pos);
        let node = parseTree.getNodeAtLocation(location);
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
