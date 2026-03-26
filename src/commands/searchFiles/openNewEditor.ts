import { languages, workspace, window, Uri } from "vscode";
import { languageId } from "./constants";

export async function openNewEditor() {
    const uri = Uri.file("Search results").with({
        scheme: "untitled",
    });
    const document = await workspace.openTextDocument(uri);
    const searchResultsDocument = await languages.setTextDocumentLanguage(
        document,
        languageId,
    );
    return window.showTextDocument(searchResultsDocument, {
        preview: false,
    });
}
