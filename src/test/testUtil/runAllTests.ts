import * as path from "node:path";
import fastGlob from "fast-glob";
import Mocha from "mocha";

export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: "tdd",
        color: true,
        // grep: "performSearch",
    });

    const cwd = path.resolve(__dirname, "..");

    const files = fastGlob.sync("**/**.test.js", { cwd }).toSorted();

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
        } catch (error) {
            console.error(error);
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(error);
        }
    });
}
