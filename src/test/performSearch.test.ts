import * as assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import type { WorkspaceFolder } from "vscode";
import * as vscode from "vscode";
import { performWorkspaceSearch } from "../commands/searchFiles/performSearch";

const testFiles = [
    "node_modules/ignored.ts",
    "apps/a.ts",
    "src/apps/b.ts",
    "src/apps/c.js",
    "src/apps.ts",
    "src/features/d.ts",
];

suite("performSearch", () => {
    let workspace: WorkspaceFolder;

    suiteSetup(async () => {
        const tempRoot = await fs.mkdtemp(
            path.join(os.tmpdir(), "andreas-vscode-perform-search"),
        );
        workspace = {
            uri: vscode.Uri.file(tempRoot),
            name: "perform-search-fixture",
            index: 0,
        };

        await Promise.all(
            testFiles.map(async (file) => {
                const fullPath = path.join(tempRoot, file);
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.writeFile(fullPath, "");
            }),
        );
    });

    suiteTeardown(async () => {
        await fs.rm(workspace.uri.fsPath, { recursive: true, force: true });
    });

    test("Find files with .ts extension", async () => {
        const workspaceResult = await performWorkspaceSearch(workspace, ".ts");
        assert.equal(workspaceResult.files.length, 4);
    });

    test("Find files named apps", async () => {
        const workspaceResult = await performWorkspaceSearch(workspace, "apps");
        assert.equal(workspaceResult.files.length, 1);
    });

    test("Find files named APPS", async () => {
        const workspaceResult = await performWorkspaceSearch(workspace, "APPS");
        assert.equal(workspaceResult.files.length, 1);
    });

    test("Find files inside an apps directory", async () => {
        const workspaceResult = await performWorkspaceSearch(
            workspace,
            "apps/",
        );
        assert.equal(workspaceResult.files.length, 3);
    });
});
