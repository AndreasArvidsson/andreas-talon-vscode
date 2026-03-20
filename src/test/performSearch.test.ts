import * as assert from "node:assert";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import type { WorkspaceFolder } from "vscode";
import * as vscode from "vscode";
import { performWorkspaceSearch } from "../commands/searchFiles/performSearch";

const testFiles = [
    "node_modules/ignored.ts",
    "apps/my app.ts",
    "src/apps/my-app.js",
    "src/apps/sub/myApp.ts",
    "src/apps.ts",
    "src/features/foo.ts",
    "src/my/app.js",
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
        assert.deepStrictEqual(
            workspaceResult.files.map((file) => file.path),
            [
                "apps/my app.ts",
                "src/apps.ts",
                "src/apps/sub/myApp.ts",
                "src/features/foo.ts",
            ],
        );
    });

    test("Find files named apps", async () => {
        const workspaceResult = await performWorkspaceSearch(workspace, "apps");
        assert.deepStrictEqual(
            workspaceResult.files.map((file) => file.path),
            ["src/apps.ts"],
        );
    });

    test("Find files named APPS.ts", async () => {
        const workspaceResult = await performWorkspaceSearch(
            workspace,
            "APPS.ts",
        );
        assert.deepStrictEqual(
            workspaceResult.files.map((file) => file.path),
            ["src/apps.ts"],
        );
    });

    test("Find files named 'my app'", async () => {
        const workspaceResult = await performWorkspaceSearch(
            workspace,
            "my app",
        );
        assert.deepStrictEqual(
            workspaceResult.files.map((file) => file.path),
            ["apps/my app.ts", "src/apps/my-app.js", "src/apps/sub/myApp.ts"],
        );
    });

    test("Find files inside an apps directory", async () => {
        const workspaceResult = await performWorkspaceSearch(
            workspace,
            "apps/",
        );
        assert.deepStrictEqual(
            workspaceResult.files.map((file) => file.path),
            ["apps/my app.ts", "src/apps/my-app.js"],
        );
    });

    test("Find files inside an apps and sub directories", async () => {
        const workspaceResult = await performWorkspaceSearch(
            workspace,
            "apps/*",
        );
        assert.deepStrictEqual(
            workspaceResult.files.map((file) => file.path),
            ["apps/my app.ts", "src/apps/my-app.js", "src/apps/sub/myApp.ts"],
        );
    });

    test("Respect .gitignore entries", async () => {
        await fs.writeFile(
            path.join(workspace.uri.fsPath, ".gitignore"),
            "src/features/\napps/my app.ts\n",
        );

        try {
            const workspaceResult = await performWorkspaceSearch(
                workspace,
                ".ts",
            );
            assert.deepStrictEqual(
                workspaceResult.files.map((file) => file.path),
                ["src/apps.ts", "src/apps/sub/myApp.ts"],
            );
        } finally {
            await fs.rm(path.join(workspace.uri.fsPath, ".gitignore"));
        }
    });
});
