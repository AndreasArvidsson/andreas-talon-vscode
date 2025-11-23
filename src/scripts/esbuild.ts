import esbuild, { type BuildOptions } from "esbuild";
import { glob } from "glob";

export async function runEsbuild() {
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
            ...glob.sync("src/test/**/*.test.ts"),
        ],
    });
}
