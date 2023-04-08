/* eslint-disable @typescript-eslint/naming-convention */

import { json, updater } from "./meta-updater";
import { updatePackageJson } from "./updatePackageJson";

updater({
    "package.json": json(updatePackageJson)
});
