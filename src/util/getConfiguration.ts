/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { isTesting } from "./isTesting";

type Configuration = {
    "talonFormatter.columnWidth": number | null;
};

const testValues: Configuration = {
    "talonFormatter.columnWidth": 28
};

type ConfigurationKey = keyof Configuration;

export function getConfiguration(key: ConfigurationKey) {
    if (isTesting()) {
        return testValues[key];
    }
    return vscode.workspace.getConfiguration("andreas").get<number | null>(key)!;
}
