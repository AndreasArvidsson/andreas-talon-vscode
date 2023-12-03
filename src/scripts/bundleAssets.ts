import { copy } from "fs-extra";
import { lstat, mkdir } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.join(__dirname, "../..");
const sourceRoot = path.join(projectRoot, "src");
const destinationRoot = path.join(projectRoot, "out");

async function copyAsset(source: string, destination?: string) {
    const fullSource = path.join(sourceRoot, source);
    const fullDestination = path.join(destinationRoot, destination ?? source);

    console.log(`Copying ${fullSource} to ${fullDestination}`);

    const stat = await (async () => {
        try {
            return await lstat(fullSource);
        } catch (error) {
            console.log(error);
            throw Error(`Missing asset: ${fullSource}`);
        }
    })();

    if (stat.isDirectory()) {
        await mkdir(fullDestination, { recursive: true });
    } else {
        await mkdir(path.dirname(fullDestination), { recursive: true });
    }

    await copy(fullSource, fullDestination);
}

void copyAsset("treeSitter/queries");
