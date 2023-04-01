import { env } from "vscode";
import { getFilename } from "./getFilename";

export async function copyFilename(): Promise<void> {
    const filename = getFilename();

    await env.clipboard.writeText(filename);
}
