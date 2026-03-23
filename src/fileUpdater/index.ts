import { updater } from "file-updater";
import { updatePackageJson } from "./updatePackageJson";
import { updateReadme } from "./updateReadme";

export async function runFileUpdater() {
    await updater({
        "README.md": updateReadme,
        "package.json": updatePackageJson(),
    });
}
