import { lstat, mkdir } from "node:fs/promises";
import * as path from "node:path";
import { copy } from "fs-extra";

const projectRoot = path.join(__dirname, "../../..");
const sourceRoot = path.join(projectRoot, "src");
const destinationRoot = path.join(projectRoot, "out");

async function copyAsset(source: string, destination?: string): Promise<void> {
    const fullSource = path.join(sourceRoot, source);
    const fullDestination = path.join(destinationRoot, destination ?? source);

    console.log(`Copying ${fullSource} to ${fullDestination}`);

    // oxlint-disable-next-line typescript/explicit-function-return-type
    const stat = await (async () => {
        try {
            return await lstat(fullSource);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            throw new Error(`Missing asset ${fullSource}: ${message}`, {
                cause: error,
            });
        }
    })();

    if (stat.isDirectory()) {
        await mkdir(fullDestination, { recursive: true });
    } else {
        await mkdir(path.dirname(fullDestination), { recursive: true });
    }

    await copy(fullSource, fullDestination);
}

export async function bundleAssets(): Promise<void> {
    console.log("Bundling assets:");

    await copyAsset("treeSitter/queries");

    // Needed for editorconfig in @cursorless/talon-tools
    await copyAsset(
        "../node_modules/@one-ini/wasm/one_ini_bg.wasm",
        "one_ini_bg.wasm",
    );
}
