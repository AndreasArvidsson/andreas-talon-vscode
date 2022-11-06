import * as vscode from "vscode";

export default async (name: string): Promise<any> => {
    const extension = vscode.extensions.getExtension(name);
    if (!extension) {
        throw Error(`Depends on extension '${name}'`);
    }

    return extension.activate();
};
