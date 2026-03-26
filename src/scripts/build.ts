import { bundleAssets } from "./bundleAssets";
import { runEsbuild } from "./esbuild";

async function build() {
    await runEsbuild();

    console.log();

    await bundleAssets();
}

// oxlint-disable-next-line unicorn/prefer-top-level-await
void build().catch((e) => {
    console.error(e);
    process.exit(1);
});
