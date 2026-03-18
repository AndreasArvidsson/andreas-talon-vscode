import {
    DocumentLink,
    type DocumentLinkProvider,
    type TextDocument,
    type Range,
    type Uri,
} from "vscode";
import { parseDocument } from "./parseDocument";

export class SearchDocumentLinkProvider implements DocumentLinkProvider {
    provideDocumentLinks(document: TextDocument): DocumentLink[] {
        const { workspaces, buttons } = parseDocument(document);
        return [
            ...workspaces.flatMap((ws) => ws.files.map(link)),
            ...buttons.map(link),
        ];
    }
}

function link(source: { range: Range; uri: Uri }): DocumentLink {
    return new DocumentLink(source.range, source.uri);
}
