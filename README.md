# VSCode extension used by Talon Voice

VSCode extension used by my personal [Talon scripts](https://github.com/AndreasArvidsson/andreas-talon).

Accessible in the vscode marketplace as [Andreas Talon](https://marketplace.visualstudio.com/items?itemName=AndreasArvidsson.andreas-talon)

In constant development. Things will break!

## Commands

Many of the commands take arguments and return values that can only be used with the [Command server](https://marketplace.visualstudio.com/items?itemName=pokey.command-server)

### File commands

-   `andreas.getFilename(): string`  
    Get filename of active file.
-   `andreas.copyFilename()`  
    Copy filename of active file to clipboard.
-   `andreas.newFile(name?: string)`  
    Create new file. Uses selected text and current file extension as suggestion.
-   `andreas.duplicateFile(name?: string)`  
    Create duplicate/copy of active file.
-   `andreas.renameFile(name?: string)`  
    Rename active file.
-   `andreas.removeFile()`  
    Remove/delete the active file.
-   `andreas.moveFile()`  
    Move active file to new directory.

### Edit commands

-   `andreas.generateRange(start: number = 1)`  
    Generate numerical range. Starts from 1 by default
-   `andreas.increment()`  
    Increment selected number.
-   `andreas.decrement()`  
    Decrement selected number.

### Nav commands

-   `andreas.openEditorAtIndex(index: number)`  
    Open editor/tab at given index. Negative indices are counted from the back.
-   `andreas.selectTo(line: number)`  
    Select from current location to specified line.
-   `andreas.lineMiddle()`  
    Move curser to middle of the current line.

### Git commands

-   `andreas.getGitFileURL({ useSelection: boolean, useBranch: boolean }): string`  
    Get URL to Git repository file webpage. Optionally include selected line numbers.
-   `andreas.getGitRepoURL(): string`  
    Get URL to Git repository webpage.
-   `andreas.getGitIssuesURL(): string`  
    Get URL to Git repository issues webpage.
-   `andreas.getGitNewIssueURL(): string`  
    Get URL to Git repository new issue webpage.
-   `andreas.getGitPullRequestsURL(): string`  
    Get URL to Git repository pull requests webpage.

### Other commands

-   `andreas.getSelectedText(): string[]`  
    Get selected text.
-   `andreas.getClassName(): string`  
    Get class name. Useful for inserting constructors in C++/Java.
-   `andreas.getDictationContext(): {before: string, after: string}`  
    Get text before and after selection. Used for context sensitive dictation.
-   `andreas.getSetting(section: string, defaultValue?: T): T | undefined`  
    Get setting from vscode
-   `andreas.setSetting(section: string, value: any)`  
    Set setting for vscode
-   `andreas.executeCommands(commands: string[])`  
    Sequentially execute multiple commands. Useful for keybindings.
-   `andreas.printCommands()`  
    Print available commands.

## Talon language features

-   Adds document formatter for Talon files.
-   Adds definitions for Talon actions, lists and captures.
-   Adds hover for Talon actions, lists and captures.

### Disable formatting on save for Talon files

```json
"[talon]": {
    "editor.formatOnSave": false
}
```

## Quick fix code actions

-   Convert line and block comments to JS/Java doc comments

## Demo

[YouTube - On hover and go to definition demo](https://youtu.be/UdMLNVLkBkg)

## Build

```bash
$ npm install -g vsce
$ vsce package
```

## Dependencies

-   [Command server](https://marketplace.visualstudio.com/items?itemName=pokey.command-server)
-   [Parse tree](https://marketplace.visualstudio.com/items?itemName=pokey.parse-tree)

## Resources

-   [Talon Voice](https://talonvoice.com)
