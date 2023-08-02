import * as vscode from "vscode";
import path from "node:path";
import { getFullCommand } from "./util/getFullCommand";

export function createTabView(): vscode.Disposable {
    return new TreeDataProvider();
}

const activeIcon = path.join(__filename, "..", "..", "images", "dash.svg");

class TreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private readonly _onDidChangeTreeData = new vscode.EventEmitter<void>();
    private readonly mainDisposable: vscode.Disposable;
    private onTabChangeDisposable: vscode.Disposable | undefined;
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {
        const treeView = vscode.window.createTreeView("andreas.tabs", {
            treeDataProvider: this
        });

        this.mainDisposable = vscode.Disposable.from(
            treeView.onDidChangeVisibility(() => this.onVisibilityChange(treeView.visible)),
            treeView
        );
    }

    private onVisibilityChange(visible: boolean) {
        if (visible) {
            if (this.onTabChangeDisposable == null) {
                const onTabChange = () => this._onDidChangeTreeData.fire();
                this.onTabChangeDisposable = vscode.Disposable.from(
                    vscode.window.tabGroups.onDidChangeTabGroups(() => onTabChange()),
                    vscode.window.tabGroups.onDidChangeTabs(() => onTabChange())
                );
            }
        } else {
            if (this.onTabChangeDisposable != null) {
                this.onTabChangeDisposable.dispose();
                this.onTabChangeDisposable = undefined;
            }
        }
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): vscode.TreeItem[] {
        const tabGroups = [...vscode.window.tabGroups.all];
        tabGroups.sort((a) => (a.isActive ? -1 : 0));

        let index = 0;

        return tabGroups.flatMap((group, groupIndex) => {
            const tabs = group.tabs.map((tab) => this.createItem(tab, index++));
            if (groupIndex < tabGroups.length) {
                tabs.push({});
            }
            return tabs;
        });
    }

    private createItem(tab: vscode.Tab, index: number): vscode.TreeItem {
        const labelParts = [(index + 1).toString().padStart(2), tab.label];
        if (tab.isDirty) {
            labelParts.push("●");
        }
        return {
            label: labelParts.join(" "),
            iconPath: tab.isActive ? activeIcon : undefined,
            command: {
                title: `Focus tab ${index + 1}`,
                command: getFullCommand("openEditorAtIndex"),
                arguments: [index]
            }
        };
    }

    dispose() {
        this.mainDisposable.dispose();
        this.onTabChangeDisposable?.dispose();
    }
}
