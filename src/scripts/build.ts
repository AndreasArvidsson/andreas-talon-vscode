import { exit } from "node:process";
import { bundleAssets } from "./bundleAssets";
import { runEsbuild } from "./esbuild";

async function build() {
    await runEsbuild();

    console.log();

    await bundleAssets();
}

// oxlint-disable-next-line unicorn/prefer-top-level-await
void build().catch((error: unknown) => {
    console.error(error);
    exit(1);
});
