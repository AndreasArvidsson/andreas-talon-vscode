import { Location, window } from "vscode";
import { GetNodeAtLocation } from "./typings/parserTree";

export default (getNodeAtLocation: GetNodeAtLocation): string | null => {
    try {
        const editor = window.activeTextEditor!;
        const pos = editor.selection.active;
        const location = new Location(editor.document.uri, pos);
        let node = getNodeAtLocation(location);
        while (node.parent != null) {
            if (node.type === "class_declaration") {
                return node.childForFieldName("name")!.text;
            }
            node = node.parent;
        }
    } catch (error) {
        console.log(error);
    }
    return null;
};
