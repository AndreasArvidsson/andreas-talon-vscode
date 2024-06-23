/* eslint-disable @typescript-eslint/naming-convention */
import { updater } from "file-updater";
import { updatePackageJson } from "./updatePackageJson";
import { updateReadme } from "./updateReadme";

import {
    updateEslintrc,
    updateGitignore,
    updateLicense,
    updatePrettierignore,
    updatePrettierrc,
    updateTsconfig,
    updateVscodeSettings,
    type UpdaterConfig
} from "ts-archetype";

const config: UpdaterConfig = {
    author: "Andreas Arvidsson",
    authorRepository: "https://github.com/AndreasArvidsson",
    funding: "https://github.com/sponsors/AndreasArvidsson",
    projectName: "example-project",
    displayName: "Example project",
    projectType: "vscodeExtension"
};

export async function runFileUpdater() {
    await updater({
        "README.md": updateReadme,
        "package.json": updatePackageJson(),
        ".eslintrc.json": updateEslintrc(config),
        ".gitignore": updateGitignore(config),
        ".prettierignore": updatePrettierignore(config),
        ".prettierrc.json": updatePrettierrc(config),
        ".vscode/settings.json": updateVscodeSettings(config),
        LICENSE: updateLicense(config),
        "tsconfig.json": updateTsconfig(config)
    });
}
