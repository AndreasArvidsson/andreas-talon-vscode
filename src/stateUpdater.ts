import deepEqual from "fast-deep-equal";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { Debouncer } from "./util/debounce";

const file = vscode.Uri.file(path.join(os.tmpdir(), "vscodeState.json"));

interface Editor {
    fileName: string;
    languageId: string;
    path: string | undefined;
    isActive: boolean;
}

interface State {
    workspaceFolders: string[];
    editors: Editor[];
}

const settingSection = "andreas.private";
const settingName = "trackState";
const fullSettingName = `${settingSection}.${settingName}`;

let currentState: State | undefined = undefined;

const debouncer = new Debouncer(16, updateState);

export function registerStateUpdater(): vscode.Disposable {
    let disposable: vscode.Disposable | undefined = undefined;

    const evaluateSetting = async () => {
        if (readSetting()) {
            if (disposable != null) {
                return;
            }

            const run = () => debouncer.run();

            // Initial state
            run();

            disposable = vscode.Disposable.from(
                // Switch window / vscode instance
                vscode.window.onDidChangeWindowState(run),
                // Switch workspace
                vscode.workspace.onDidChangeWorkspaceFolders(run),
                // Close editor. This can be done without changing focus.
                vscode.workspace.onDidCloseTextDocument(() => {
                    console.log("onDidCloseTextDocument");
                    debouncer.run();
                }),
                // Focus editor
                vscode.window.onDidChangeActiveTextEditor(() => {
                    console.log("onDidChangeActiveTextEditor");
                    debouncer.run();
                })
            );
        } else if (disposable != null) {
            disposable.dispose();
            disposable = undefined;
            await resetState();
        }
    };

    // Update state when extension initializes. This happens whenever you change workspace/session.
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

function updateState() {
    console.log("updateState");
    const workspaceFolders =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];

    console.log(vscode.window.visibleTextEditors.length);

    const editors = vscode.window.visibleTextEditors.map(
        (editor): Editor => ({
            // Do we need all of this?
            fileName: editor.document.fileName,
            languageId: editor.document.languageId,
            path: editor.document.uri.fsPath,
            isActive: editor === vscode.window.activeTextEditor
        })
    );

    // Extension?

    void updateStateFile({
        workspaceFolders,
        editors
    });
}

async function resetState() {
    await updateStateFile({
        workspaceFolders: [],
        editors: []
    });
}

async function updateStateFile(state: State) {
    if (!vscode.window.state.focused || deepEqual(currentState, state)) {
        return;
    }
    const updatedJson = JSON.stringify(state, null, 4);
    const bytes = new TextEncoder().encode(updatedJson);
    await vscode.workspace.fs.writeFile(file, bytes);
    currentState = state;
}
