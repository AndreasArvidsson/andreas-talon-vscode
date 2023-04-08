import { commandDescriptions } from "../commands/commands";
import { getFullCommand } from "../util/getFullCommand";

export function updateReadme(content: string): string {
    const header = "## Commands";
    const indexStart = content.indexOf(header);
    const indexEnd = content.indexOf("\n## ", indexStart + header.length);
    const pre = content.substring(0, indexStart);
    const post = content.substring(indexEnd);

    const commands: string[] = [header];
    let category = "";

    for (const [command, desc] of Object.entries(commandDescriptions)) {
        if (category !== desc.category) {
            category = desc.category;
            commands.push(`\n### ${category} commands\n`);
        }
        const fullCommand = getFullCommand(command);
        commands.push(`-   \`${fullCommand}${desc.args}\`  `);
        commands.push(`    ${desc.description}`);
    }

    commands.push("");

    return pre + commands.join("\n") + post;
}
