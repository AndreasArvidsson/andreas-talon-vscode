import { exit } from "node:process";
import { bundleAssets } from "./bundleAssets";
import { runEsbuild } from "./esbuild";

void (async (): Promise<void> => {
    try {
        await runEsbuild();

        console.log();

        await bundleAssets();
    } catch (error: unknown) {
        console.error(error);
        exit(1);
    }
})();
