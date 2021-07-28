import { window, Location } from "vscode";

export default (getNodeAtLocation: any) => {
    const editor = window.activeTextEditor!;
    const pos = editor.selection.active;
    try {
        const location = new Location(editor.document.uri, pos);
        console.log(location);
        let node = getNodeAtLocation(location);
        console.log(node.text);
        while (node.parent != null) {
            console.log(node.type);
            node = node.parent;
        }
    } catch (error) {
        console.log(error);
    }
};
