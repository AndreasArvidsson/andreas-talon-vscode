// import * as cp from "child_process";
import { downloadAndUnzipVSCode, runTests } from "@vscode/test-electron";
import * as path from "path";

export async function launchVscodeAndRunTests() {
    try {
        const outDirPath = path.join(__dirname, "../../out");
        const extensionTestsPath = path.join(outDirPath, "test/testUtil/runAllTests.js");
        const extensionDevelopmentPath = outDirPath;

        console.log(`extensionTestsPath: ${extensionTestsPath}`);
        console.log(`extensionDevelopmentPath: ${extensionDevelopmentPath}`);

        const vscodeExecutablePath = await downloadAndUnzipVSCode("stable");

        console.log(`vscodeExecutablePath: ${vscodeExecutablePath}`);

        // Install extension dependencies
        // const extensionInstallArgs = [
        //     ...args,
        //     ...extensionDependencies.flatMap((dependency) => ["--install-extension", dependency])
        // ];

        // console.log("starting to install dependency extensions");
        // console.log(`cli: ${cli}`);
        // console.log(JSON.stringify(extensionInstallArgs, null, 2));

        // const { status, signal, error } = cp.spawnSync(cli, extensionInstallArgs, {
        //     encoding: "utf-8",
        //     stdio: "inherit"
        // });

        // console.log("status: ", status);
        // console.log("signal: ", signal);
        // console.log("error: ", error);

        // console.log("finished installing dependency extensions");

        // Run the integration test
        const code = await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath
        });

        console.log(`Returned from "runTests" with value: ${code}`);
    } catch (err) {
        console.error("Test run threw exception:");
        console.error(err);
        process.exit(1);
    }
}

void launchVscodeAndRunTests();
