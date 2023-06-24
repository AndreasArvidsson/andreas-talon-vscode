import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    CodeActionTriggerKind,
    Disposable,
    languages,
    Location,
    Range,
    TextDocument,
    WorkspaceEdit
} from "vscode";
import { ParseTreeExtension } from "../typings/parserTree";

abstract class ProviderCodeActions implements CodeActionProvider {
    protected abstract docActionName: string;

    constructor(private parseTreeExtension: ParseTreeExtension) {}

    provideCodeActions(
        document: TextDocument,
        range: Range,
        context: CodeActionContext,
        _token: CancellationToken
    ): CodeAction[] | undefined {
        if (context.triggerKind === CodeActionTriggerKind.Automatic) {
            return undefined;
        }

        const commentAction = this.getCommentEdit(document, range);

        if (commentAction != null) {
            return [commentAction];
        }

        return undefined;
    }

    protected getNodes(document: TextDocument, range: Range) {
        const nodeStart = this.parseTreeExtension.getNodeAtLocation(
            new Location(document.uri, range.start)
        );
        const nodeEnd = range.isEmpty
            ? nodeStart
            : this.parseTreeExtension.getNodeAtLocation(
                  new Location(document.uri, range.end.translate(undefined, -1))
              );
        return [nodeStart, nodeEnd];
    }

    protected getCommentEdit(document: TextDocument, range: Range): CodeAction | undefined {
        const [nodeStart, nodeEnd] = this.getNodes(document, range);

        if (nodeStart.type === nodeEnd.type && this.isComment(nodeStart.type)) {
            const commentRange = new Range(
                nodeStart.startPosition.row,
                0,
                nodeEnd.endPosition.row,
                nodeEnd.endPosition.column
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
                CodeActionKind.RefactorRewrite
            );
            action.edit = new WorkspaceEdit();
            action.edit.replace(document.uri, commentRange, text);
            return action;
        }

        return undefined;
    }

    protected abstract isComment(type: string): boolean;
    protected abstract isDocComment(type: string, text: string): boolean;
    protected abstract isBlockComment(type: string, text: string): boolean;
    protected abstract isLineComment(type: string, text: string): boolean;
}

class ProvideCodeActionsJava extends ProviderCodeActions {
    docActionName = "JavaDoc";

    protected isComment(type: string): boolean {
        return type === "block_comment" || type === "line_comment";
    }

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

    protected isComment(type: string): boolean {
        return type === "comment";
    }

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

export function registerLanguageCodeActions(parseTreeExtension: ParseTreeExtension): Disposable {
    const codeActionsProviderJava = new ProvideCodeActionsJava(parseTreeExtension);
    const codeActionsProviderJs = new ProvideCodeActionsJs(parseTreeExtension);

    return Disposable.from(
        languages.registerCodeActionsProvider("java", codeActionsProviderJava),
        languages.registerCodeActionsProvider("javascript", codeActionsProviderJs),
        languages.registerCodeActionsProvider("typescript", codeActionsProviderJs),
        languages.registerCodeActionsProvider("javascriptreact", codeActionsProviderJs),
        languages.registerCodeActionsProvider("typescriptreact", codeActionsProviderJs)
    );
}
