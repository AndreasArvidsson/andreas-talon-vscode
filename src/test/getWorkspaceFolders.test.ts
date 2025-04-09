import * as assert from "assert";
import * as vscode from "vscode";
import { CommandId } from "../commands/commands";
import { getFullCommand } from "../util/getFullCommand";

suite("Get Workspace Folders Command", () => {
    test("getWorkspaceFolders returns an array of file system paths for workspace folders", async () => {
        const command = getFullCommand("getWorkspaceFolders" as CommandId);

        // Execute the command
        const result = await vscode.commands.executeCommand(command);

        // Check that the result is an array of file system paths
        const expectedPaths = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath);
        assert.deepStrictEqual(result, expectedPaths);
    });
});
