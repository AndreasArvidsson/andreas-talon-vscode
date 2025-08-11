import * as vscode from "vscode";

export function getSetting<T>(
    section: string,
    defaultValue?: T,
): T | undefined {
    return vscode.workspace.getConfiguration().get(section, defaultValue);
}

type ConfigurationTarget = "global" | "workspace" | "workspaceFolder";

export function setSetting(
    section: string,
    value: any,
    configurationTarget?: ConfigurationTarget,
) {
    return vscode.workspace
        .getConfiguration()
        .update(
            section,
            value,
            configurationTarget != null
                ? getConfigurationTarget(configurationTarget)
                : undefined,
        );
}

function getConfigurationTarget(
    configurationTarget: ConfigurationTarget,
): vscode.ConfigurationTarget {
    switch (configurationTarget) {
        case "global":
            return vscode.ConfigurationTarget.Global;
        case "workspace":
            return vscode.ConfigurationTarget.Workspace;
        case "workspaceFolder":
            return vscode.ConfigurationTarget.WorkspaceFolder;
        default:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new Error(
                `Unknown configuration target: ${configurationTarget}`,
            );
    }
}
