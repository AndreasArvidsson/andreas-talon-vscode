import { exit } from "node:process";
import { updater } from "file-updater";
import { getErrorMessage } from "../../util/getErrorMessage";
import { updatePackageJson } from "./updatePackageJson";
import { updateReadme } from "./updateReadme";

async function run() {
    try {
        await updater({
            "README.md": updateReadme,
            "package.json": updatePackageJson(),
        });
    } catch (error: unknown) {
        console.error(getErrorMessage(error));
        exit(1);
    }
}

// oxlint-disable-next-line unicorn/prefer-top-level-await
void run();
