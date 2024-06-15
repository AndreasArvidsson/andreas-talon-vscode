import { globSync } from "glob";
import Mocha from "mocha";
import * as path from "node:path";
import * as vscode from "vscode";

export async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: "tdd",
        color: true
    });

    console.log("extensions");
    for (const extension of vscode.extensions.all) {
        if (!extension.id.startsWith("vscode.")) {
            console.log(extension.id, extension.isActive);
            if (extension.id.startsWith("AndreasArvidsson")) {
                await extension.activate();
            }
        }
    }

    const cwd = path.resolve(__dirname, "..");

    const files = globSync("**/**.test.js", { cwd }).sort();

    files.forEach((f) => mocha.addFile(path.resolve(cwd, f)));

    return new Promise((resolve, reject) => {
        try {
            // Run the mocha test
            mocha.run((failures) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}
