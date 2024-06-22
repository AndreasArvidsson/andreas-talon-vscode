import * as vscode from "vscode";
import * as os from "node:os";
import * as path from "node:path";

const file = vscode.Uri.file(path.join(os.tmpdir(), "vscodeState.json"));

interface State {
    workspaceFolders: string[];
}

const settingSection = "andreas.private";
const settingName = "trackState";
const fullSettingName = `${settingSection}.${settingName}`;

export function registerStateUpdater(): vscode.Disposable {
    let disposable: vscode.Disposable | undefined = undefined;

    const evaluateSetting = async () => {
        disposable?.dispose();

        if (readSetting()) {
            await updateState();

            disposable = vscode.Disposable.from(
                vscode.workspace.onDidChangeWorkspaceFolders(() => updateState()),
                vscode.window.onDidChangeWindowState(async (states) => {
                    if (states.focused) {
                        await updateState();
                    }
                })
            );
        } else {
            disposable = undefined;
            await resetState();
        }
    };

    // Update state when extension initializes. This happens whenever you change a workspace/session.
    void evaluateSetting();

    return vscode.Disposable.from(
        vscode.workspace.onDidChangeConfiguration(async ({ affectsConfiguration }) => {
            if (affectsConfiguration(fullSettingName)) {
                await evaluateSetting();
            }
        }),
        {
            dispose: () => {
                disposable?.dispose();
            }
        }
    );
}

function readSetting(): boolean {
    return vscode.workspace.getConfiguration(settingSection).get<boolean>(settingName) ?? false;
}

async function updateState() {
    const workspaceFolders =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];

    await updateStateFile({
        workspaceFolders
    });
}

async function resetState() {
    await updateStateFile({
        workspaceFolders: []
    });
}

async function getCurrentJson(): Promise<string | undefined> {
    try {
        const buffer = await vscode.workspace.fs.readFile(file);
        return buffer.toString();
    } catch (error) {
        return undefined;
    }
}

async function updateStateFile(state: State) {
    const currentJson = await getCurrentJson();
    const updatedJson = JSON.stringify(state, null, 4);

    if (currentJson !== updatedJson) {
        await vscode.workspace.fs.writeFile(file, Buffer.from(updatedJson));
    }
}
