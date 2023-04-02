import path from "node:path";
import {
    FileType,
    QuickPickItem,
    QuickPickItemKind,
    Uri,
    WorkspaceFolder,
    window,
    workspace
} from "vscode";
import * as fileSystem from "../../util/fileSystem";
import { getGitIgnore } from "../../util/gitIgnore";

interface FileQuickPickItem extends QuickPickItem {
    path: string;
    move?: boolean;
    select?: string;
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
        const gitIgnore = getGitIgnore(workspaceDir);
        const quickPick = window.createQuickPick<FileQuickPickItem>();
        quickPick.ignoreFocusOut = true;

        async function changeDirectory(dir: string, select?: string) {
            const items: FileQuickPickItem[] = [];

            items.push({ label: "$(file) Move file here", path: dir, move: true });
            items.push({ label: "", path: "", kind: QuickPickItemKind.Separator });

            if (dir !== workspaceDir) {
                items.push({
                    label: "$(folder) ..",
                    path: path.dirname(dir),
                    select: dir
                });
            }

            const uri = Uri.file(dir);
            const files = await workspace.fs.readDirectory(uri);

            for (const [name, type] of files) {
                if (type === FileType.Directory) {
                    const folderPath = path.join(dir, name);
                    const relativePath = path.relative(workspaceDir, folderPath);
                    if (!gitIgnore(relativePath)) {
                        items.push({
                            label: `$(folder) ${name}`,
                            path: folderPath
                        });
                    }
                }
            }

            const title = path
                .join(workspaceFolder.name, path.relative(workspaceDir, dir))
                .replaceAll(path.sep, " > ");

            quickPick.title = title;
            quickPick.value = "";
            quickPick.items = items;
            quickPick.activeItems = [items.find((i) => i.path === select) ?? items[2]];
        }

        quickPick.onDidAccept(async () => {
            const selection = quickPick.activeItems[0];
            if (selection.move) {
                quickPick.hide();
                resolve(selection.path);
            } else {
                await changeDirectory(selection.path, selection.select);
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
