import { json } from "file-updater";
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

export function updatePackageJson() {
    return json((content: PackageJson | null): PackageJson => {
        if (content == null) {
            return {};
        }

        return {
            ...content,
            contributes: {
                ...content.contributes,
                commands: getCommands()
            }
        };
    });
}

function getCommands(): Command[] {
    return Object.entries(commandDescriptions)
        .filter(([, { isPrivate }]) => !isPrivate)
        .map(([command, { title, isVisible }]) => ({
            command: getFullCommand(command as CommandId),
            category: `Andreas`,
            title,
            ...(isVisible ? {} : { enablement: "false" })
        }));
}
