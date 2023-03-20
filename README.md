# VSCode extension used by Talon Voice

VSCode extension used by my personal [Talon scripts](https://github.com/AndreasArvidsson/andreas-talon).

Accessible in the vscode marketplace as [Andreas Talon](https://marketplace.visualstudio.com/items?itemName=AndreasArvidsson.andreas-talon)

In constant development. Things will break!

## Commands

-   `andreas.selectTo(line: number)`  
     Select from current location to specified line.
-   `andreas.lineMiddle()`  
     Move curser to middle of the current line.
-   `andreas.executeCommands(commands: string[])`  
    Sequentially execute multiple commands. Useful for keybindings.
-   `andreas.printCommands()`  
     Print available commands.
-   `andreas.getSelectedText(): string[]`  
    Get selected text.
-   `andreas.getDictationContext(): string`  
    Get text before and after selection. Used for context sensitive dictation.
-   `andreas.increment()`  
    Increment selected number.
-   `andreas.decrement()`  
    Decrement selected number.
-   `andreas.generateRange(start: number = 1)`  
    Generate numerical range starting from given number.
-   `andreas.openEditorAtIndex(index: number)`  
    Open editor/tab at given index. Negative indices are counted from the back.
-   `andreas.getFileName(): string`  
    Get file name of active editor.
-   `andreas.newFile(name? string)`  
    Create new file. Uses selected text and current file extension as suggestion.
-   `andreas.getClassName(): string`  
    Get class name. Useful for inserting constructor in C++/Java.
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

## Talon language features

-   Adds document formatter for Talon files.
-   Adds definitions for Talon actions, lists and captures.

### Disable formatting on save for Talon files

```json
"[talon]": {
    "editor.formatOnSave": false
}
```

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
