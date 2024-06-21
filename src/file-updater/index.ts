import { updater, json } from "file-updater";
import { updatePackageJson } from "./updatePackageJson";
import { updateReadme } from "./updateReadme";

export function runFileUpdater() {
    return updater(() => {
        return {
            ["package.json"]: json(updatePackageJson),
            ["README.md"]: updateReadme
        };
    });
}
