import {
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
    runTests,
} from "@vscode/test-electron";
import * as cp from "child_process";
import * as path from "path";

const extensionDependencies = [
    // Cursorless access to Tree sitter
    "pokey.parse-tree",

    // Register necessary language-IDs for tests
    "mrob95.vscode-talonscript", // talon
    "jrieken.vscode-tree-sitter-query", // scm
];

export async function launchVscodeAndRunTests() {
    try {
        const workspaceFolder = path.join(__dirname, "../..");
        const extensionTestsPath = path.join(workspaceFolder, "out/test/testUtil/runAllTests");
        const extensionDevelopmentPath = workspaceFolder;

        const vscodeExecutablePath = await downloadAndUnzipVSCode("stable");

        installExtensionDependencies(vscodeExecutablePath);

        // Run the integration test
        const code = await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
        });

        if (code !== 0) {
            console.log(`Returned from "runAllTests" with value: ${code}`);
        }
    } catch (err) {
        console.error("Test run threw exception:");
        console.error(err);
        process.exit(1);
    }
}

function installExtensionDependencies(vscodeExecutablePath: string) {
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install extension dependencies
    const extensionInstallArgs = [
        ...args,
        ...extensionDependencies.flatMap((dependency) => ["--install-extension", dependency]),
    ];

    console.log("Installing dependency extensions...");
    console.log(`cli: ${cli}`);
    console.log(JSON.stringify(extensionInstallArgs, null, 2));

    const { status, signal, error } = cp.spawnSync(cli, extensionInstallArgs, {
        encoding: "utf-8",
        stdio: "inherit",
    });

    if (status !== 0) {
        console.log("status: ", status);
    }
    if (signal) {
        console.log("signal: ", signal);
    }
    if (error) {
        console.log("error: ", error);
    }

    console.log("Finished installing dependency extensions");
}

void launchVscodeAndRunTests();
