import { CommandId, commandDescriptions } from "../commands/commands";
import { getFullCommand } from "../util/getFullCommand";

interface Command {
    command: string;
    title: string;
    enablement?: string;
}

interface PackageJson {
    contributes?: {
        commands?: Command[];
    };
}

export function updatePackageJson(content: PackageJson): PackageJson {
    content.contributes = {
        ...(content.contributes ?? {}),
        commands: getCommands()
    };

    return content;
}

function getCommands(): Command[] {
    return Object.entries(commandDescriptions).map(([command, { category, title, isVisible }]) => ({
        command: getFullCommand(command as CommandId),
        category: `Andreas (${category})`,
        title,
        ...(isVisible ? {} : { enablement: "false" })
    }));
}
