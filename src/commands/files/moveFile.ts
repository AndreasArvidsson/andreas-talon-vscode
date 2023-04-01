import * as path from "path";
import { FileType, QuickPickItem, Uri, WorkspaceFolder, window, workspace } from "vscode";
import * as fileSystem from "../../util/fileSystem";

interface FileQuickPickItem extends QuickPickItem {
    path: string;
    move?: boolean;
}

export async function moveFile(): Promise<void> {
    const editor = window.activeTextEditor;
    const uri = editor?.document?.uri;

    if (uri?.scheme !== "file") {
        throw Error("Can't move unsaved file");
    }

    const folder = await showFolderPicker(uri);

    if (folder && folder !== path.dirname(uri.fsPath)) {
        const filename = path.basename(uri.fsPath);
        const newPath = path.join(folder, filename);
        await fileSystem.moveFile(uri, Uri.file(newPath));
    }
}

function showFolderPicker(uri: Uri): Promise<string | undefined> {
    return new Promise<string | undefined>((resolve) => {
        const workspaceFolder = getWorkspaceFolder(uri);
        const workspaceDir = workspaceFolder.uri.fsPath;
        const quickPick = window.createQuickPick();
        quickPick.ignoreFocusOut = true;

        async function changeDirectory(dir: string) {
            const items: FileQuickPickItem[] = [];

            items.push({ label: "$(file) Move file here", path: dir, move: true });

            if (dir !== workspaceDir) {
                items.push({ label: "$(folder) ..", path: path.dirname(dir) });
            }

            const uri = Uri.file(dir);
            const files = await workspace.fs.readDirectory(uri);

            for (const [name, type] of files) {
                if (type === FileType.Directory) {
                    items.push({
                        label: `$(folder) ${name}`,
                        path: path.join(dir, name)
                    });
                }
            }

            const title = path
                .join(workspaceFolder.name, path.relative(workspaceDir, dir))
                .replaceAll(path.sep, " > ");

            quickPick.title = title;
            quickPick.value = "";
            quickPick.items = items;
            quickPick.activeItems = [items[1]];
        }

        quickPick.onDidAccept(async () => {
            const selection = quickPick.activeItems[0] as FileQuickPickItem;
            if (selection.move) {
                quickPick.hide();
                resolve(selection.path);
            } else {
                await changeDirectory(selection.path);
            }
        });

        quickPick.onDidHide(() => {
            resolve(undefined);
        });

        void changeDirectory(path.dirname(uri.fsPath));

        quickPick.show();
    });
}

function getWorkspaceFolder(uri: Uri): WorkspaceFolder {
    const folder = workspace.getWorkspaceFolder(uri);

    if (!folder) {
        throw Error("Can't find workspace for file");
    }

    return folder;
}
