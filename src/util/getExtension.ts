import * as vscode from "vscode";
import type { CommandServerExtension } from "../typings/commandServer";
import type { GitExtension } from "../typings/git";
import type { ParseTreeExtension } from "../typings/parserTree";

async function getExtension<T>(name: string): Promise<T> {
    const extension = vscode.extensions.getExtension(name);

    if (extension == null) {
        console.log("Available extensions:");
        for (const ext of vscode.extensions.all.map((e) => e.id).toSorted()) {
            console.log(`  ${ext}`);
        }

        throw new Error(`Depends on missing extension '${name}'`);
    }

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return extension.activate() as Promise<T>;
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
