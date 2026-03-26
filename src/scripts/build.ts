import { exit } from "node:process";
import { bundleAssets } from "./bundleAssets";
import { runEsbuild } from "./esbuild";

async function build() {
    try {
        await runEsbuild();

        console.log();

        await bundleAssets();
    } catch (error: unknown) {
        console.error(error);
        exit(1);
    }
}

// oxlint-disable-next-line unicorn/prefer-top-level-await
void build();
