import fs from "node:fs";
import path from "node:path";

export function json<T>(callback: (content: T) => T) {
    return (content: string): string => {
        const jsonContent = JSON.parse(content) as T;
        const jsonContentUpdated = callback(jsonContent);
        return JSON.stringify(jsonContentUpdated, null, 4) + "\n";
    };
}

export function updater(replacers: Record<string, (content: string) => string>) {
    if (isTest()) {
        updaterTest(replacers);
    } else {
        updaterWrite(replacers);
    }
}

function updaterTest(replacers: Record<string, (content: string) => string>) {
    const files = updaterInner(replacers).filter((f) => f.didChange);

    if (files.length) {
        console.error(`Updater found changes to ${files.length} files:`);
        for (const file of files) {
            console.error(file.name);
        }
        process.exit(1);
    }
}

function updaterWrite(replacers: Record<string, (content: string) => string>) {
    const files = updaterInner(replacers);

    for (const file of files) {
        if (file.didChange) {
            writeFile(file.path, file.contentUpdated);
        }
    }
}

function updaterInner(replacers: Record<string, (content: string) => string>) {
    const workspaceDir = getWorkspaceDir();

    return Object.entries(replacers).map(([filename, callback]) => {
        const filePath = path.join(workspaceDir, filename);
        const fileContent = readFile(filePath);
        const fileContentUpdated = callback(fileContent);
        return {
            name: filename,
            path: filePath,
            content: fileContent,
            contentUpdated: fileContentUpdated,
            didChange: fileContent !== fileContentUpdated
        };
    });
}

function getWorkspaceDir(): string {
    let dir = __dirname;
    for (;;) {
        const packageJsonPath = path.join(dir, "package.json");
        if (fs.existsSync(packageJsonPath)) {
            return dir;
        }
        const parent = path.dirname(dir);
        if (dir === parent) {
            throw Error("Can't find workspace root containing 'package.json'");
        }
        dir = parent;
    }
}

function readFile(file: string): string {
    return fs.readFileSync(file, { encoding: "utf8" });
}

function writeFile(file: string, data: string) {
    fs.writeFileSync(file, data, { encoding: "utf8" });
}

function isTest() {
    return process.argv.slice(2).includes("--test");
}
