import * as vscode from "vscode";
import { CommandServerExtension } from "../typings/commandServer";
import { GitExtension } from "../typings/git";
import { ParseTreeExtension } from "../typings/parserTree";

async function getExtension<T>(name: string): Promise<T> {
    const extension = vscode.extensions.getExtension(name);
    if (!extension) {
        throw Error(`Depends on extension '${name}'`);
    }

    return extension.activate();
}

export function getParseTreeExtension(): Promise<ParseTreeExtension> {
    return getExtension("pokey.parse-tree");
}

export function getCommandServerExtension(): Promise<CommandServerExtension> {
    return getExtension("pokey.command-server");
}

export function getGitExtension(): Promise<GitExtension> {
    return getExtension("vscode.git");
}
