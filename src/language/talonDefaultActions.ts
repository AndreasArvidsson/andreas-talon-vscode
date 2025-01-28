import { TalonMatch } from "./matchers";
import actionsJson from "./talonDefaultActions.json";

interface RawActionDesc {
    name: string;
    signature: string;
    docstr: string;
}

interface ActionDesc {
    language: "python";
    path: "Talon default";
    name: string;
    docstr: string;
    targetText: string;
}

const rawActionsList = actionsJson as RawActionDesc[];

const actionsList = rawActionsList.map((action): ActionDesc => {
    return {
        language: "python",
        path: "Talon default",
        name: action.name,
        docstr: action.docstr,
        targetText: getTargetText(action)
    };
});

function getTargetText(action: RawActionDesc): string {
    const { signature, docstr } = action;
    const name = getNameWithoutNamespace(action.name);
    return `def ${name}${signature}:\n    """${docstr}"""`;
}

function getNameWithoutNamespace(name: string): string {
    const index = name.indexOf(".");
    return index === -1 ? name : name.slice(index + 1);
}

export function searchInDefaultTalonActions(match: TalonMatch): ActionDesc[] {
    if (match.type !== "action") {
        return [];
    }
    if ("name" in match) {
        return actionsList.filter((r) => r.name === match.name);
    }
    return actionsList.filter((r) => r.name.startsWith(match.prefix));
}
