import esbuild from "esbuild";
import type { BuildOptions } from "esbuild";
import fastGlob from "fast-glob";

export async function runEsbuild(): Promise<void> {
    console.log("Running esbuild");

    const optionsCommon: BuildOptions = {
        bundle: true,
        format: "cjs",
        platform: "node",
        outdir: "out",
        external: ["vscode", "prettier", "mocha"],
    };

    await esbuild.build({
        ...optionsCommon,
        entryPoints: ["src/extension.ts"],
        minify: true,
        sourcemap: true,
    });

    await esbuild.build({
        ...optionsCommon,
        entryPoints: [
            "src/fileUpdater/index.ts",
            "src/test/testUtil/runAllTests.ts",
            ...fastGlob.sync("src/test/**/*.test.ts"),
        ],
    });
}
