import {
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
    runTests
} from "@vscode/test-electron";
import * as cp from "child_process";
import * as path from "path";

const extensionDependencies = [
    // Cursorless access to Tree sitter
    "pokey.parse-tree",

    // Register necessary language-IDs for tests
    "mrob95.vscode-talonscript", // talon
    "jrieken.vscode-tree-sitter-query" // scm
];

function installExtensionDependencies(vscodeExecutablePath: string) {
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install extension dependencies
    const extensionInstallArgs = [
        ...args,
        ...extensionDependencies.flatMap((dependency) => ["--install-extension", dependency])
    ];

    console.log("starting to install dependency extensions");
    console.log(`cli: ${cli}`);
    console.log(JSON.stringify(extensionInstallArgs, null, 2));

    const { status, signal, error } = cp.spawnSync(cli, extensionInstallArgs, {
        encoding: "utf-8",
        stdio: "inherit"
    });

    console.log("status: ", status);
    if (signal) {
        console.log("signal: ", signal);
    }
    if (error) {
        console.log("error: ", error);
    }

    console.log("finished installing dependency extensions\n");
}

export async function launchVscodeAndRunTests() {
    try {
        const rootPath = path.join(__dirname, "../..");
        const extensionTestsPath = path.join(rootPath, "out/test/testUtil/runAllTests.js");
        const extensionDevelopmentPath = rootPath;

        console.log("rootPath: ", rootPath);
        console.log("extensionTestsPath: ", extensionTestsPath);
        console.log("extensionDevelopmentPath: ", extensionDevelopmentPath);

        const vscodeExecutablePath = await downloadAndUnzipVSCode("stable");

        installExtensionDependencies(vscodeExecutablePath);

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
