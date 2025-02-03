import * as vscode from "vscode";
import { formatCommentsForEditor } from "./formatComments";

const settingSection = "andreas";
const settingName = "formatCommentsOnSave";
const fullSettingName = `${settingSection}.${settingName}`;

export function registerFormatCommentsOnSave(): vscode.Disposable {
    let disposable: vscode.Disposable | undefined = undefined;

    const evaluateSetting = () => {
        if (readSetting()) {
            if (disposable == null) {
                disposable = vscode.workspace.onDidSaveTextDocument(async (document) => {
                    const editor = vscode.window.visibleTextEditors.find(
                        (e) => e.document === document
                    );
                    if (editor != null) {
                        await formatCommentsForEditor(editor);
                    }
                });
            }
        } else if (disposable != null) {
            disposable.dispose();
            disposable = undefined;
        }
    };

    // Evaluate when extension initializes. This happens whenever you change a workspace/session.
    evaluateSetting();

    return vscode.Disposable.from(
        vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
            if (affectsConfiguration(fullSettingName)) {
                evaluateSetting();
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
