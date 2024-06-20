import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";

type UpdaterCallback<T> = (content: T | null, filePath: string) => T | null | Promise<T | null>;

interface UpdaterConfig<T> {
    read(filePath: string): Promise<T | null>;
    update: UpdaterCallback<T>;
    equal(expected: T | null, actual: T | null): boolean;
    write(filePath: string, expected: T | null): Promise<void>;
}

type Updater<T> = UpdaterConfig<T> | UpdaterCallback<string>;

export function json<T>(callback: UpdaterCallback<T>): UpdaterConfig<T> {
    return {
        read: async (filePath) => {
            const content = await readFile(filePath);
            return content != null ? (JSON.parse(content) as T) : null;
        },
        update: (content, filePath) => {
            return callback(content, filePath);
        },
        equal: (expected, actual) => {
            return JSON.stringify(expected) === JSON.stringify(actual);
        },
        write: (filePath, expected) => {
            if (expected == null) {
                return removeFile(filePath);
            } else {
                const jsonString = JSON.stringify(expected, null, 4) + "\n";
                return writeFile(filePath, jsonString);
            }
        }
    };
}

function text(callback: UpdaterCallback<string>): UpdaterConfig<string> {
    return {
        read: (filePath) => {
            return readFile(filePath);
        },
        update: (content, filePath) => {
            return callback(content, filePath);
        },
        equal: (expected, actual) => {
            return expected === actual;
        },
        write: (filePath, expected) => {
            if (expected == null) {
                return removeFile(filePath);
            } else {
                return writeFile(filePath, expected);
            }
        }
    };
}

export async function updater(replacers: Record<string, Updater<any>>) {
    const replacersConfigs = convertCallbacksToConfigs(replacers);
    const files = await updaterInner(replacersConfigs);
    const changedFiles = files.filter((f) => f.didChange);

    if (changedFiles.length === 0) {
        console.log("Updater found no changes to files.");
        return;
    }

    const msg = `Updater found changes to ${changedFiles.length} files:`;

    if (isTest()) {
        console.error(`ERROR: ${msg}`);
        for (const file of changedFiles) {
            console.error(file.toString());
        }
        process.exit(1);
    }

    console.log(msg);
    for (const file of changedFiles) {
        console.log(file.toString());
        await file.write();
    }
}

function updaterInner(replacers: Record<string, UpdaterConfig<unknown>>) {
    const workspaceDir = getWorkspaceDir();

    return Promise.all(
        Object.entries(replacers).map(async ([filename, config]) => {
            const filePath = path.join(workspaceDir, filename);
            const contentActual = await Promise.resolve(config.read(filePath));
            const contentExpected = config.update(contentActual, filePath);
            const relativePath = path.relative(workspaceDir, filePath).replace(/\\/g, "/");
            return {
                didChange: !config.equal(contentExpected, contentActual),
                write: () => config.write(filePath, contentExpected),
                toString: () => `    ${relativePath}`
            };
        })
    );
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

function convertCallbacksToConfigs(
    replacers: Record<string, Updater<unknown>>
): Record<string, UpdaterConfig<any>> {
    return Object.fromEntries(
        Object.entries(replacers).map(([filename, callback]) => {
            return [filename, typeof callback === "function" ? text(callback) : callback];
        })
    );
}

async function readFile(filePath: string): Promise<string | null> {
    try {
        return await fsPromises.readFile(filePath, "utf8");
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return null;
        }
        throw error;
    }
}

function writeFile(filePath: string, data: string): Promise<void> {
    return fsPromises.writeFile(filePath, data, "utf8");
}

function removeFile(filePath: string): Promise<void> {
    try {
        return fsPromises.unlink(filePath);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return Promise.resolve();
        }
        throw error;
    }
}

function isTest(): boolean {
    return process.argv.slice(2).includes("--test");
}
