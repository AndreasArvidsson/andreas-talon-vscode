import { commandDescriptions } from "../../commands/commands";
import { getFullCommand } from "../../util/getFullCommand";
import { objectEntries } from "../../util/objectUtil";

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
        return {
            pre: content.slice(0, indexStart),
            post: content.slice(indexEnd),
        };
    })();

    const commands: string[] = [];
    let category = "";

    for (const [command, desc] of objectEntries(commandDescriptions)) {
        if (desc.excludeReadme) {
            continue;
        }
        if (category !== desc.category) {
            category = desc.category;
            commands.push(`\n### ${category} commands\n`);
        }
        const fullCommand = getFullCommand(command);
        commands.push(`- \`${fullCommand}${desc.args}\` \\`);
        commands.push(`  ${desc.description}`);
    }

    commands.push("");

    return pre + commands.join("\n") + post;
}
