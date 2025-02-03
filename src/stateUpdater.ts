import deepEqual from "fast-deep-equal";
import * as os from "node:os";
import * as path from "node:path";
import * as vscode from "vscode";
import { Debouncer } from "./util/debounce";

const file = vscode.Uri.file(path.join(os.tmpdir(), "vscodeState.json"));

interface State {
    workspaceFolders: string[];
    languageIds: string[];
    extensions: string[];
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
                // Open editor. Also triggers on language change.
                vscode.workspace.onDidOpenTextDocument(() => {
                    console.log("onDidOpenTextDocument");
                    debouncer.run();
                }),
                vscode.window.onDidChangeVisibleTextEditors(() => {
                    console.log("onDidChangeVisibleTextEditors");
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
    if (!vscode.window.state.focused) {
        return;
    }
    console.log(
        "updateState",
        vscode.window.visibleTextEditors.length,
        vscode.extensions.all.length
    );

    const workspaceFolders =
        vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];

    const languageIds = [
        ...new Set(
            vscode.window.visibleTextEditors.map((editor) => editor.document.languageId)
        ).values()
    ].sort();

    const extensions = vscode.extensions.all
        .filter((extension) => extension.isActive && !extension.id.startsWith("vscode."))
        .map((extension) => extension.id)
        .sort();

    void updateStateFile({
        workspaceFolders,
        languageIds,
        extensions
    });
}

async function resetState() {
    await updateStateFile({
        workspaceFolders: [],
        languageIds: [],
        extensions: []
    });
}

async function updateStateFile(state: State) {
    // TODO: This causes problem focusingBetweenWindows.
    // if (deepEqual(currentState, state)) {
    //     return;
    // }
    currentState = state;
    const updatedJson = JSON.stringify(state, null, 4);
    const bytes = new TextEncoder().encode(updatedJson);
    await vscode.workspace.fs.writeFile(file, bytes);
}
