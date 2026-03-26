import * as fs from "node:fs";
import * as path from "node:path";
import { GLOB_IGNORE_PATTERNS } from "@cursorless/talon-tools";
import type { WorkspaceFolder } from "vscode";

export function getGlobIgnorePatterns(workspace: WorkspaceFolder): string[] {
    return [...GLOB_IGNORE_PATTERNS, ...getGitIgnorePatterns(workspace)];
}

function getGitIgnorePatterns(workspace: WorkspaceFolder): string[] {
    return readGitIgnoreFile(workspace)
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter(
            (line) =>
                // Ignore empty lines and comments
                line.length > 0 && !line.startsWith("#"),
        )
        .flatMap(convertGitIgnoreLineToGlob);
}

function convertGitIgnoreLineToGlob(line: string): string[] {
    if (line.startsWith("!")) {
        // Negated ignore patterns are not supported by fast-glob, so skip them.
        console.warn(
            `Negated ignore pattern "${line}" is not supported and will be ignored.`,
        );
        return [];
    }

    // Normalize the raw .gitignore entry into the relative POSIX-style path
    // format expected by fast-glob. We unescape leading "\#" / "\!" entries,
    // remove trailing slashes so directory handling is centralized below, and
    // convert Windows separators to forward slashes.
    const normalizedLine = line
        .replace(/^\\(?=[#!])/u, "")
        .replace(/\/+$/u, "")
        .replaceAll("\\", "/");

    if (normalizedLine.length === 0) {
        return [];
    }

    const directorySuffix = line.endsWith("/") ? "/**" : "";

    if (line.startsWith("/")) {
        // "/foo" is anchored to the workspace root, so match only that exact
        // relative path and not nested copies further down the tree.
        return [`${normalizedLine.slice(1)}${directorySuffix}`];
    }

    if (normalizedLine.includes("/")) {
        // "foo/bar" is already a relative path pattern, so preserve it as-is
        // relative to the workspace root.
        return [`${normalizedLine}${directorySuffix}`];
    }

    // "foo" has no slash, which in .gitignore means match that name at any
    // depth, so expand it to a recursive glob.
    return [`**/${normalizedLine}${directorySuffix}`];
}

function readGitIgnoreFile(workspace: WorkspaceFolder): string {
    const gitignoreFilePath = path.join(workspace.uri.fsPath, ".gitignore");
    try {
        return fs.readFileSync(gitignoreFilePath, "utf8");
    } catch (error) {
        if (
            error instanceof Error &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return "";
        }
        throw error;
    }
}
