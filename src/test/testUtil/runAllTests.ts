import { globSync } from "glob";
import Mocha from "mocha";
import * as path from "node:path";

export function run(): Promise<void> {
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
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
        }
    });
}
