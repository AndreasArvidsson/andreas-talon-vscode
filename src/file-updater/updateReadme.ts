import { CommandId, commandDescriptions } from "../commands/commands";
import { getFullCommand } from "../util/getFullCommand";

export function updateReadme(content: string | null): string {
    const header = "## Commands";

    const { pre, post } = (() => {
        if (content == null) {
            return { pre: "", post: "" };
        }
        const indexHeader = content.indexOf(header);
        const indexStart = content.indexOf(
            "\n### ",
            indexHeader + header.length,
        );
        const indexEnd = content.indexOf("\n## ", indexStart + 4);
        const pre = content.substring(0, indexStart);
        const post = content.substring(indexEnd);
        return { pre, post };
    })();

    const commands: string[] = [];
    let category = "";

    for (const [command, desc] of Object.entries(commandDescriptions)) {
        if (desc.isPrivate) {
            continue;
        }
        if (category !== desc.category) {
            category = desc.category;
            commands.push(`\n### ${category} commands\n`);
        }
        const fullCommand = getFullCommand(command as CommandId);
        commands.push(`- \`${fullCommand}${desc.args}\`  `);
        commands.push(`  ${desc.description}`);
    }

    commands.push("");

    return pre + commands.join("\n") + post;
}
