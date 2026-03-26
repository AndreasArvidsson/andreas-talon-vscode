import { DocumentLink } from "vscode";
import type { DocumentLinkProvider, TextDocument } from "vscode";
import { parseDocument } from "./parseDocument";

export class SearchDocumentLinkProvider implements DocumentLinkProvider {
    provideDocumentLinks(document: TextDocument): DocumentLink[] {
        const { workspaces, buttons } = parseDocument(document);
        const result: DocumentLink[] = [];
        let hasSelectedFile = false;

        for (const ws of workspaces) {
            for (const file of ws.files) {
                result.push(new DocumentLink(file.range, file.uri));
                if (file.selected) {
                    hasSelectedFile = true;
                }
            }
        }

        if (hasSelectedFile) {
            for (const button of buttons) {
                result.push(new DocumentLink(button.range, button.uri));
            }
        }

        return result;
    }
}
