// import * as cp from "child_process";
import { downloadAndUnzipVSCode, runTests } from "@vscode/test-electron";
import * as path from "path";
import { getEnvironmentVariableStrict } from "./getEnvironmentVariableStrict";

export async function launchVscodeAndRunTests() {
    try {
        const extensionTestsPath = path.join(__dirname, "../test/testUtil/runAllTests.ts");
        const extensionDevelopmentPath = path.join(__dirname, "../../out");

        const crashDir = getEnvironmentVariableStrict("VSCODE_CRASH_DIR");
        const logsDir = getEnvironmentVariableStrict("VSCODE_LOGS_DIR");

        const vscodeVersion = "stable";
        const vscodeExecutablePath = await downloadAndUnzipVSCode(vscodeVersion);

        console.log(`extensionTestsPath: ${extensionTestsPath}`);
        console.log(`extensionDevelopmentPath: ${extensionDevelopmentPath}`);

        console.log(`crashDir: ${crashDir}`);
        console.log(`logsDir: ${logsDir}`);

        const a = getEnvironmentVariableStrict("github.workspace");
        console.log(`github.workspace: ${a}`);

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

        console.log("finished installing dependency extensions");

        // Run the integration test
        const code = await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [`--crash-reporter-directory=${crashDir}`, `--logsPath=${logsDir}`]
        });

        console.log(`Returned from "runTests" with value: ${code}`);
    } catch (err) {
        console.error("Test run threw exception:");
        console.error(err);
        process.exit(1);
    }
}

void launchVscodeAndRunTests();
