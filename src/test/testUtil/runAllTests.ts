import { globSync } from "glob";
import Mocha from "mocha";
import * as path from "node:path";
import * as vscode from "vscode";

export async function run(): Promise<void> {
    //  vscode.workspace
    // .getConfiguration()
    // .update(
    //     "editor",
    //     "detectIndentation",

    // );

    const a = vscode.workspace.getConfiguration().get("editor.detectIndentation");
    console.log("editor.detectIndentation", a);

    const mocha = new Mocha({
        ui: "tdd",
        color: true
    });

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
