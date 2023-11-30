import * as vscode from "vscode";
import * as os from "node:os";
import * as path from "node:path";

const file = vscode.Uri.file(path.join(os.tmpdir(), "vscodeState.json"));

interface State {
    workspaceFolders: string[];
}

export function registerStateUpdater(): vscode.Disposable {
    const updateState = async () => {
        const state: State = {
            workspaceFolders: getWorkspaceFolders()
        };

        const currentJson = await getCurrentJson();
        const updatedJson = JSON.stringify(state, null, 4);

        if (currentJson !== updatedJson) {
            await updateStateFile(updatedJson);
        }
    };

    // Update state filed when extension initializes. This happens whenever you change a workspace/session.
    void updateState();

    return vscode.Disposable.from(
        vscode.workspace.onDidChangeWorkspaceFolders(() => updateState()),
        vscode.window.onDidChangeWindowState((states) => {
            if (states.focused) {
                void updateState();
            }
        })
    );
}

function getWorkspaceFolders(): string[] {
    return vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ?? [];
}

async function getCurrentJson(): Promise<string | undefined> {
    try {
        const buffer = await vscode.workspace.fs.readFile(file);
        return buffer.toString();
    } catch (error) {
        return undefined;
    }
}

function updateStateFile(state: string) {
    return vscode.workspace.fs.writeFile(file, Buffer.from(state));
}
