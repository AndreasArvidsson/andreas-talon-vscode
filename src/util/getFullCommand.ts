import { CommandId } from "../commands/commands";

export function getFullCommand(command: CommandId): string {
    return `andreas.${command}`;
}
