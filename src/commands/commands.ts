type Category = "File" | "Edit" | "Nav" | "Git" | "Other";

interface CommandDescription {
    readonly isVisible: boolean;
    readonly category: Category;
    readonly title: string;
    readonly description?: string;
}

function create(
    isVisible: boolean,
    category: Category,
    title: string,
    description?: string
): CommandDescription {
    return {
        isVisible,
        category,
        title,
        description
    };
}

function visible(category: Category, title: string, description?: string) {
    return create(true, category, title, description);
}

function hidden(category: Category, title: string, description?: string) {
    return create(false, category, title, description);
}

export const commandDescriptions = {
    // File commands
    getFilename: hidden("File", "Get filename of active file."),
    copyFilename: visible("File", "Copy filename of active file to clipboard."),
    newFile: visible(
        "File",
        "Create new file.",
        "Uses selected text and current file extension as suggestion."
    ),
    duplicateFile: visible("File", "Create duplicate/copy of active file."),
    renameFile: visible("File", "Rename active file."),
    removeFile: visible("File", "Remove/delete the active file."),
    moveFile: visible("File", "Move active file to new directory."),
    // Edit commands
    generateRange: visible("Edit", "Generate numerical range.", "Starts from 1 by default"),
    increment: visible("Edit", "Increment selected number."),
    decrement: visible("Edit", "Decrement selected number."),
    // Navigation commands
    openEditorAtIndex: hidden(
        "Nav",
        "Open editor/tab at given index.",
        "Negative indices are counted from the back."
    ),
    selectTo: hidden("Nav", "Select from current location to specified line."),
    lineMiddle: visible("Nav", "Move curser to middle of the current line."),
    // Git commands
    getGitFileURL: hidden(
        "Git",
        "Get URL to Git repository file webpage.",
        "Optionally include selected line numbers."
    ),
    getGitRepoURL: hidden("Git", "Get URL to Git repository webpage."),
    getGitIssuesURL: hidden("Git", "Get URL to Git repository issues webpage."),
    getGitNewIssueURL: hidden("Git", "Get URL to Git repository new issue webpage."),
    getGitPullRequestsURL: hidden("Git", "Get URL to Git repository pull requests webpage."),
    // Other commands
    getSelectedText: hidden("Other", "Get selected text."),
    getClassName: hidden(
        "Other",
        "Get class name.",
        "Useful for inserting constructors in C++/Java."
    ),
    getDictationContext: hidden(
        "Other",
        "Get text before and after selection.",
        "Used for context sensitive dictation."
    ),
    executeCommands: hidden(
        "Other",
        "Sequentially execute multiple commands.",
        "Useful for keybindings."
    ),
    printCommands: visible("Other", "Print available commands.")
} as const;

export type CommandIds = keyof typeof commandDescriptions;
