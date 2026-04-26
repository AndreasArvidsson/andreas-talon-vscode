import { commandDescriptions } from "../../commands/commands";
import { getFullCommand } from "../../util/getFullCommand";
import { objectEntries } from "../../util/objectUtil";

export function updateReadme(content: string | null): string {
    const header = "## Commands";

    const { pre, post } = ((): { pre: string; post: string } => {
        if (content == null) {
            return { pre: "", post: "" };
        }
        const indexHeader = content.indexOf(header);
        const indexStart = content.indexOf(
            "\n### ",
            indexHeader + header.length,
        );
        const indexEnd = content.indexOf("\n## ", indexStart + 4);
        return {
            pre: content.slice(0, indexStart),
            post: content.slice(indexEnd),
        };
    })();

    const commands: string[] = [];
    let category = "";

    for (const [
        command,
        { args, category: descCategory, description, excludeReadme },
    ] of objectEntries(commandDescriptions)) {
        if (excludeReadme) {
            continue;
        }
        if (category !== descCategory) {
            category = descCategory;
            commands.push(`\n### ${category} commands\n`);
        }
        const fullCommand = getFullCommand(command);
        commands.push(`- \`${fullCommand}${args}\` \\`);
        commands.push(`  ${description}`);
    }

    commands.push("");

    return pre + commands.join("\n") + post;
}
