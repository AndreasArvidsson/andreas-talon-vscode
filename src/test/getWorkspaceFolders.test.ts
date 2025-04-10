import * as assert from "assert";
import * as vscode from "vscode";
import { getFullCommand } from "../util/getFullCommand";

const command = "getWorkspaceFolders";

suite(command, () => {
    test("Return value", async () => {
        const fullCommand = getFullCommand(command);

        // Execute the command
        const result = await vscode.commands.executeCommand(fullCommand);

        // Check that the result is an array of file system paths
        const expectedPaths = vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath);
        assert.deepStrictEqual(result, expectedPaths);
    });
});
