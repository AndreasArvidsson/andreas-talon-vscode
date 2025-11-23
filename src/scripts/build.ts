import { bundleAssets } from "./bundleAssets";
import { runEsbuild } from "./esbuild";

async function build() {
    await runEsbuild();

    console.log();

    await bundleAssets();
}

void build().catch((e) => {
    console.error(e);
    process.exit(1);
});
