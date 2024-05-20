import { workspace, ConfigurationTarget } from "vscode";

export function getSetting<T>(section: string, defaultValue?: T): T | undefined {
    return workspace.getConfiguration().get(section, defaultValue);
}

export function setSetting(section: string, value: any, configurationTarget?: boolean | ConfigurationTarget) {
    return workspace.getConfiguration().update(section, value, configurationTarget);
}
