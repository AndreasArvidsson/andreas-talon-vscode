import * as cp from "node:child_process";
import * as path from "node:path";
import { exit } from "node:process";
import {
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
    runTests,
} from "@vscode/test-electron";

const extensionDependencies = [
    // Cursorless access to Tree sitter
    "pokey.parse-tree",

    // Register necessary language-IDs for tests
    "mrob95.vscode-talonscript",
    "jrieken.vscode-tree-sitter-query",
];

export async function launchVscodeAndRunTests(): Promise<void> {
    try {
        const workspaceFolder = path.join(__dirname, "../..");
        const extensionTestsPath = path.join(
            workspaceFolder,
            "out/test/testUtil/runAllTests",
        );
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
    } catch (error) {
        console.error("Test run threw exception:");
        console.error(error);
        exit(1);
    }
}

function installExtensionDependencies(vscodeExecutablePath: string) {
    const [cli, ...args] =
        resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    // Install extension dependencies
    const extensionInstallArgs = [
        ...args,
        ...extensionDependencies.flatMap((dependency) => [
            "--install-extension",
            dependency,
        ]),
    ];

    console.log("Installing dependency extensions...");
    console.log(`cli: ${cli}`);
    console.log(JSON.stringify(extensionInstallArgs, null, 2));

    const { status, signal, error } = cp.spawnSync(cli, extensionInstallArgs, {
        encoding: "utf8",
        stdio: "inherit",
        shell: process.platform === "win32",
    });

    const messageParts: string[] = [];

    if (status != null && status !== 0) {
        messageParts.push(`Status: ${status}`);
    }
    if (signal != null) {
        messageParts.push(`Signal: ${signal}`);
    }
    if (messageParts.length > 0) {
        const message = `Extension installation failed. ${messageParts.join(", ")}`;
        if (error == null) {
            throw new Error(message);
        }
        console.error(message);
    }
    if (error != null) {
        throw error;
    }

    console.log("Finished installing dependency extensions");
}

// oxlint-disable-next-line unicorn/prefer-top-level-await
void launchVscodeAndRunTests();
