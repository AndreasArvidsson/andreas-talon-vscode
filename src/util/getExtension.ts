import * as vscode from "vscode";
import { GitExtension } from "../typings/git";
import { ParseTreeExtension } from "../typings/parserTree";

const getExtension = async (name: string): Promise<any> => {
    const extension = vscode.extensions.getExtension(name);
    if (!extension) {
        throw Error(`Depends on extension '${name}'`);
    }

    return extension.activate();
};

export const getParseTreeExtension = (): Promise<ParseTreeExtension> => {
    return getExtension("pokey.parse-tree");
};

export const getGitExtension = (): Promise<GitExtension> => {
    return getExtension("vscode.git");
};
