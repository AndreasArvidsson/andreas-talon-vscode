import { window } from "vscode";
import { GitExtension, Repository, API } from "./typings/git";

export default {
    getURL: (gitExtension: GitExtension, lineNumber: boolean) => {
        const api = gitExtension.getAPI(1);
        const filePath = window.activeTextEditor?.document.uri.path;
        if (!filePath) {
            return null;
        }
        const repository = getRepository(api, filePath);
        if (!repository) {
            return null;
        }
        const remote = getRemote(repository);
        const branch = getBranch(repository);
        if (!remote || !branch) {
            return null;
        }
        const platform = getPlatform(remote);
        if (!platform) {
            return null;
        }
        const repoPath = repository.rootUri.path;
        const path = filePath.substring(repoPath.length + 1);
        const commit = repository.state.HEAD?.commit;
        const url = toWebPage(platform, remote, branch, path, commit);
        return lineNumber ? addLineNumber(platform, url) : url;
    },
};

const getRepository = (api: API, filePath: string) =>
    api.repositories.find((r) => filePath.startsWith(r.rootUri.path));

function getRemote(repository: Repository) {
    const name = repository.state.HEAD?.upstream?.remote;
    for (const remote of repository.state.remotes) {
        if (remote.name !== name) {
            continue;
        }
        if (remote.fetchUrl) {
            return remote.fetchUrl;
        }
        if (remote.pushUrl) {
            return remote.pushUrl;
        }
    }
    return null;
}

function getBranch(repository: Repository) {
    return repository.state.HEAD?.name;
}

function toWebPage(
    platform: Platform,
    remote: string,
    branch: string,
    filePath: string,
    commit?: string
) {
    const host = remoteToWebPage(remote);
    const commitOrBranch = commit ?? branch;
    switch (platform) {
        case "github":
            return `${host}/blob/${commitOrBranch}/${filePath}`;
        case "bitbucket":
            return `${host}/src/${commitOrBranch}/${filePath}`;
    }
}

function remoteToWebPage(remote: string) {
    if (remote.startsWith("git@")) {
        remote = remote.replace(":", "/").replace("git@", "https://");
    }
    if (remote.endsWith(".git")) {
        remote = remote.substring(0, remote.length - 4);
    }
    return remote;
}

function addLineNumber(platform: Platform, url: string) {
    const editor = window.activeTextEditor!;
    const line = editor.selection.active.line + 1;
    switch (platform) {
        case "github":
            return `${url}#L${line}`;
        case "bitbucket":
            return `${url}#lines-${line}`;
    }
}

function getPlatform(remote: string): Platform | null {
    if (remote.includes("github.com")) {
        return "github";
    }
    if (remote.includes("bitbucket.org")) {
        return "bitbucket";
    }
    return null;
}

type Platform = "github" | "bitbucket";
