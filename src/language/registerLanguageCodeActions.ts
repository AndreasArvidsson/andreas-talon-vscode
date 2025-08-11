import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    CodeActionTriggerKind,
    Disposable,
    languages,
    Range,
    TextDocument,
    WorkspaceEdit,
} from "vscode";
import type { TreeSitter } from "../treeSitter/TreeSitter";

abstract class ProviderCodeActions implements CodeActionProvider {
    protected abstract docActionName: string;

    constructor(private treeSitter: TreeSitter) {}

    provideCodeActions(
        document: TextDocument,
        range: Range,
        context: CodeActionContext,
        _token: CancellationToken,
    ): CodeAction[] {
        if (context.triggerKind === CodeActionTriggerKind.Automatic) {
            return [];
        }

        const commentAction = this.getCommentEdit(document, range);

        if (commentAction != null) {
            return [commentAction];
        }

        return [];
    }

    protected getCommentEdit(
        document: TextDocument,
        range: Range,
    ): CodeAction | undefined {
        const nodeStart = this.treeSitter.findsSmallestContainingPosition(
            document,
            "comment",
            range.start,
        )?.node;
        const nodeEnd = this.treeSitter.findsSmallestContainingPosition(
            document,
            "comment",
            range.end,
        )?.node;

        if (nodeStart == null || nodeEnd == null) {
            return undefined;
        }

        if (nodeStart.type === nodeEnd.type) {
            const commentRange = new Range(
                nodeStart.startPosition.row,
                0,
                nodeEnd.endPosition.row,
                nodeEnd.endPosition.column,
            );
            let text = document.getText(commentRange);

            if (this.isDocComment(nodeStart.type, text)) {
                return undefined;
            }

            if (this.isBlockComment(nodeStart.type, text)) {
                text = blockCommentToDocComment(text);
            } else if (this.isLineComment(nodeStart.type, text)) {
                text = lineCommentToDocComment(text);
            }

            const action = new CodeAction(
                `Convert to ${this.docActionName} comment`,
                CodeActionKind.RefactorRewrite,
            );
            action.edit = new WorkspaceEdit();
            action.edit.replace(document.uri, commentRange, text);
            return action;
        }

        return undefined;
    }

    protected abstract isDocComment(type: string, text: string): boolean;
    protected abstract isBlockComment(type: string, text: string): boolean;
    protected abstract isLineComment(type: string, text: string): boolean;
}

class ProvideCodeActionsJava extends ProviderCodeActions {
    docActionName = "JavaDoc";

    protected isDocComment(type: string, text: string): boolean {
        return /^\/\*\*[\s\S]*\*\/$/.test(text);
    }

    protected isBlockComment(type: string, _text: string): boolean {
        return type === "block_comment";
    }

    protected isLineComment(type: string, _text: string): boolean {
        return type === "line_comment";
    }
}

class ProvideCodeActionsJs extends ProviderCodeActions {
    docActionName = "JSDoc";

    protected isDocComment(type: string, text: string): boolean {
        return /^\/\*\*[\s\S]*\*\/$/.test(text);
    }

    protected isBlockComment(type: string, text: string): boolean {
        return /^\/\*[\s\S]*\*\/$/.test(text);
    }

    protected isLineComment(type: string, text: string): boolean {
        return /^\s*\/\//m.test(text);
    }
}

export function blockCommentToDocComment(text: string): string {
    const lines = text.split(/(\r?\n)/);
    lines[0] = lines[0].replace("/*", "/**");

    // Add a leading `*` on each line missing it
    for (let i = 1; i < lines.length - 1; ++i) {
        lines[i] = lines[i].replace(/^(\s*)(?!\*)(\S)/, "$1* $2");
    }

    return lines.join("");
}

export function lineCommentToDocComment(text: string) {
    const indent = text.match(/^\s*/)?.[0] ?? "";
    // Replace leading `//` on each line with `*`
    text = text.replace(/^(\s*)\/\/\s?/gm, "$1* ");
    // Wrap old comment in `/** */`
    return `${indent}/**\n${text}\n${indent}*/`;
}

export function registerLanguageCodeActions(
    treeSitter: TreeSitter,
): Disposable {
    const codeActionsProviderJava = new ProvideCodeActionsJava(treeSitter);
    const codeActionsProviderJs = new ProvideCodeActionsJs(treeSitter);

    return Disposable.from(
        languages.registerCodeActionsProvider("java", codeActionsProviderJava),
        languages.registerCodeActionsProvider(
            "javascript",
            codeActionsProviderJs,
        ),
        languages.registerCodeActionsProvider(
            "typescript",
            codeActionsProviderJs,
        ),
        languages.registerCodeActionsProvider(
            "javascriptreact",
            codeActionsProviderJs,
        ),
        languages.registerCodeActionsProvider(
            "typescriptreact",
            codeActionsProviderJs,
        ),
    );
}
