import * as path from "node:path";
import { IGNORE_FOLDERS } from "@cursorless/talon-tools";
import ignore from "ignore";
import type { QuickPickItem, WorkspaceFolder } from "vscode";
import { FileType, QuickPickItemKind, Uri, window, workspace } from "vscode";
import * as fileSystem from "../../util/fileSystem";
import { getDir, getFilename } from "../../util/fileSystem";
import { getActiveFileSchemaEditor } from "../../util/getActiveEditor";

interface FileQuickPickItem extends QuickPickItem {
    path: string;
    move?: boolean;
    select?: string;
}

export async function moveFile(): Promise<void> {
    const editor = getActiveFileSchemaEditor();
    const { uri } = editor.document;
    const folder = await showFolderPicker(uri);

    if (folder != null && folder !== getDir(uri)) {
        const filename = getFilename(uri);
        const newPath = path.join(folder, filename);
        await fileSystem.moveFile(uri, Uri.file(newPath));
    }
}

function showFolderPicker(uri: Uri): Promise<string | null> {
    return new Promise<string | null>((resolve) => {
        const workspaceFolder = getWorkspaceFolder(uri);
        const workspaceDir = workspaceFolder.uri.fsPath;
        const fileIgnorer = ignore().add(IGNORE_FOLDERS);
        const quickPick = window.createQuickPick<FileQuickPickItem>();
        quickPick.ignoreFocusOut = true;

        async function changeDirectory(dir: string, select?: string) {
            const items: FileQuickPickItem[] = [
                {
                    label: "$(file) Move file here",
                    path: dir,
                    move: true,
                },
                {
                    label: "",
                    path: "",
                    kind: QuickPickItemKind.Separator,
                },
            ];

            if (dir !== workspaceDir) {
                items.push({
                    label: "$(folder) ..",
                    path: path.dirname(dir),
                    select: dir,
                });
            }

            const files = await workspace.fs.readDirectory(Uri.file(dir));

            for (const [name, type] of files) {
                if (type === FileType.Directory) {
                    const folderPath = path.join(dir, name);
                    const relativePath = path.relative(
                        workspaceDir,
                        folderPath,
                    );
                    if (!fileIgnorer.ignores(relativePath)) {
                        items.push({
                            label: `$(folder) ${name}`,
                            path: folderPath,
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
            quickPick.activeItems = [
                items.find((i) => i.path === select) ?? items[2],
            ];
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
            resolve(null);
        });

        void changeDirectory(getDir(uri));

        quickPick.show();
    });
}

function getWorkspaceFolder(uri: Uri): WorkspaceFolder {
    const folder = workspace.getWorkspaceFolder(uri);

    if (folder == null) {
        throw new Error("Can't find workspace for file");
    }

    return folder;
}
