import { CommandId } from "../commands/commands";

export function getFullCommand(command: CommandId | "tabs"): string {
    return `andreas.${command}`;
}
