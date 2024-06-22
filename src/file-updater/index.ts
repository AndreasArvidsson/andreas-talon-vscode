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
    updateVscodeSettings
} from "ts-archetype";

const config = {
    author: "Andreas Arvidsson",
    authorRepository: "https://github.com/AndreasArvidsson",
    projectName: "example-project",
    displayName: "Example project"
};

export async function runFileUpdater(workspaceDir: string) {
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
