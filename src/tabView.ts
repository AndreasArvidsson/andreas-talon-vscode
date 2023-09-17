import * as vscode from "vscode";
import { getFullCommand } from "./util/getFullCommand";
import { indexToHint } from "./util/hints";

export function createTabView(): vscode.Disposable {
    return new TreeDataProvider();
}

interface GroupElement {
    type: "group";
    groupIndex: number;
    tabIndex: number;
    tabGroup: vscode.TabGroup;
}

interface TabElement {
    type: "tab";
    index: number;
    tab: vscode.Tab;
}

interface PaddingElement {
    type: "padding";
}

type Element = GroupElement | TabElement | PaddingElement;

const paddingElement: PaddingElement = { type: "padding" };

class TreeDataProvider implements vscode.TreeDataProvider<Element> {
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

    getTreeItem(element: Element): vscode.TreeItem {
        if (element.type === "group") {
            return {
                label: `GROUP ${element.groupIndex + 1}`,
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded
            };
        }
        if (element.type === "padding") {
            return {};
        }
        return createItem(element.tab, element.index);
    }

    getChildren(element?: Element): Element[] {
        if (element == null) {
            let tabIndex = 0;

            return vscode.window.tabGroups.all.flatMap((tabGroup, groupIndex) => {
                const result: GroupElement = { type: "group", groupIndex, tabIndex, tabGroup };
                tabIndex += tabGroup.tabs.length;
                return groupIndex > 0 ? [paddingElement, result] : [result];
            });
        }

        if (element.type === "group") {
            return element.tabGroup.tabs.map((tab, index) => ({
                type: "tab",
                index: element.tabIndex + index,
                tab
            }));
        }

        throw Error(`Can't get children for element type '${element.type}'`);
    }

    dispose() {
        this.mainDisposable.dispose();
        this.onTabChangeDisposable?.dispose();
    }
}

function createItem(tab: vscode.Tab, index: number): vscode.TreeItem {
    const hint = indexToHint(index);

    const labelParts = [hint.padStart(2), " - ", tab.label];
    if (tab.isDirty) {
        labelParts.push("●");
    }
    if (tab.isActive) {
        labelParts.push("*");
    }
    const label = labelParts.join(" ");

    const resourceUri = tab.input instanceof vscode.TabInputText ? tab.input.uri : undefined;

    const command: vscode.Command = {
        title: `Focus tab ${hint}`,
        command: getFullCommand("focusTab"),
        arguments: [hint]
    };

    return { label, resourceUri, command };
}
