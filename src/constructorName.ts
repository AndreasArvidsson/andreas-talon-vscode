import { window, Location } from "vscode";

interface SyntaxNode {
    id: number;
    type: string;
    text: string;
    parent: SyntaxNode;

    childForFieldName(fieldName: string): SyntaxNode | null;
}

type GetNodeAtLocation = (location: Location) => SyntaxNode;

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
