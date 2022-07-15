# VSCode extension used by Talon Voice

VSCode extension used by my personal [Talon scripts](https://github.com/AndreasArvidsson/andreas-talon).

In constant development. Things will break!

## Commands

-   `andreas.selectTo(line: number)`  
     Select from current location to specified line.
-   `andreas.lineMiddle()`  
     Move curser to middle of the current line.
-   `andreas.formatDocument()`  
     Format/auto indent talon files.
-   `andreas.executeCommands(commands: string[])`  
    Sequentially execute multiple commands. Useful for keybindings.
-   `andreas.printCommands()`  
     Print available commands.
-   `andreas.getSelectedText(): string`  
    Get selected text. Multiple selections are joined with new line.
-   `andreas.increment()`  
    Increment selected number.
-   `andreas.decrement()`  
    Decrement selected number.
-   `andreas.openEditorAtIndex(index: number)`  
    Open editor/tab at given index. Negative indices are counted from the back.
-   `andreas.getFileName(): string`  
    Get file name of active editor.
-   `andreas.undoUntilNotDirty()`  
    Undo until the document is not dirty. Same as closing and reopening the document without saving changes.
-   `andreas.getClassName(): string`  
    Get class name. Useful for inserting constructor in C++/Java.
-   `andreas.getGitURL(lineNumber: boolean): string`  
    Get URL to Git repository webpage. Optionally include selected line numbers.

## Talon language definitions

Adds definitions for Talon actions, lists and captures.

## Build

```bash
$ npm install -g vsce
$ vsce package
```

## Dependencies

-   [Command server](https://marketplace.visualstudio.com/items?itemName=pokey.command-server)

## Resources

-   [Talon Voice](https://talonvoice.com)
