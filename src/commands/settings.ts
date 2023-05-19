import { workspace } from "vscode";

export function getSetting<T>(section: string, defaultValue?: T): T | undefined {
    return workspace.getConfiguration().get(section, defaultValue);
}

export function setSetting(section: string, value: any) {
    return workspace.getConfiguration().update(section, value);
}
