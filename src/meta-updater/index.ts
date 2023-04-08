/* eslint-disable @typescript-eslint/naming-convention */

import { json, updater } from "./meta-updater";
import { updatePackageJson } from "./updatePackageJson";
import { updateReadme } from "./updateReadme";

updater({
    "package.json": json(updatePackageJson),
    "README.md": updateReadme
});
