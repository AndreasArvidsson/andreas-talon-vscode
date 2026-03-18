import { languages, workspace, window, Uri } from "vscode";

interface Props {
    languageId: string;
    name: string;
}

export async function openNewEditor({ languageId, name }: Props) {
    const uri = Uri.file(name).with({
        scheme: "untitled",
    });
    const document = await workspace.openTextDocument(uri);
    const searchResultsDocument = await languages.setTextDocumentLanguage(
        document,
        languageId,
    );
    return await window.showTextDocument(searchResultsDocument, {
        preview: false,
    });
}
