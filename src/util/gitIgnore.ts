import ignore from "ignore";
import fs from "node:fs";
import path from "node:path";

export function getGitIgnore(workspacePath: string) {
    const gitignore = ignore();

    gitignore.add([".git", ".svn", ".hg", "node_modules", "__pycache__"]);

    try {
        const gitignorePath = path.join(workspacePath, ".gitignore");
        const gitignoreContent = fs.readFileSync(gitignorePath, "utf8");
        const gitignoreLines = gitignoreContent.split("\n");
        gitignore.add(gitignoreLines);
    } catch (_ex) {
        // If .gitignore doesn't exist, we can ignore the error
    }

    return (relativePath: string) => gitignore.ignores(relativePath);
}
