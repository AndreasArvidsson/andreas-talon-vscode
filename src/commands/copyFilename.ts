import { env } from "vscode";
import getFilename from "./getFilename";

export default async (): Promise<void> => {
    const filename = getFilename();

    await env.clipboard.writeText(filename);
};
