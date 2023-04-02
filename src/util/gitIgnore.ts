import ignore from "ignore";
import fs from "node:fs";
import path from "node:path";

export function getGitIgnore(workspacePath: string) {
    const gitignore = ignore();

    gitignore.add(".git");

    try {
        const gitignorePath = path.join(workspacePath, ".gitignore");
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
        const gitignoreLines = gitignoreContent.split("\n");
        gitignore.add(gitignoreLines);
    } catch (_ex) {
        gitignore.add("node_modules");
    }

    return (relativePath: string) => gitignore.ignores(relativePath);
}
