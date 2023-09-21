import * as vscode from "vscode";
import { getFullCommand } from "./util/getFullCommand";
import { getLabelFormat, labelFormatSetting } from "./util/getLabelFormat";
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
        const treeView = vscode.window.createTreeView(getFullCommand("tabs"), {
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
                    vscode.window.tabGroups.onDidChangeTabs(() => onTabChange()),
                    vscode.workspace.onDidChangeConfiguration(({ affectsConfiguration }) => {
                        if (affectsConfiguration(labelFormatSetting)) {
                            onTabChange();
                        }
                    })
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
    const resourceUri = tab.input instanceof vscode.TabInputText ? tab.input.uri : undefined;
    const label = `${hint.padStart(2)} - ${tab.label}`;

    const command: vscode.Command = {
        title: `Focus tab ${hint}`,
        command: getFullCommand("focusTab"),
        arguments: [hint]
    };

    return {
        resourceUri,
        label,
        command,
        description: getDescription(tab, resourceUri)
    };
}

function getDescription(tab: vscode.Tab, uri?: vscode.Uri): string | undefined {
    const parts: string[] = [];

    if (uri != null) {
        const format = getLabelFormat(tab, uri);
        if (format != null) {
            parts.push(format);
        }
    }

    if (tab.isDirty) {
        parts.push("●");
    }

    if (tab.isActive) {
        parts.push("*");
    }

    return parts.join(" ");
}
