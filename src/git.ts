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
        const repoPath = repository.rootUri.path;
        const path = filePath.substring(repoPath.length + 1);
        const url = toWebPage(remote, branch, path);
        return lineNumber ? addLineNumber(url) : url;
    }
};

const getRepository = (api: API, filePath: string) =>
    api.repositories.find(r => filePath.startsWith(r.rootUri.path));

function getRemote(repository: Repository) {
    for (const remote of repository.state.remotes) {
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

function toWebPage(remote: string, branch: string, filePath: string) {
    return `${remoteToWebPage(remote)}/blob/${branch}/${filePath}`;
}

function remoteToWebPage(remote: string) {
    if (remote.startsWith("git@")) {
        remote = remote
            .replace(":", "/")
            .replace("git@", "https://");
    }
    if (remote.endsWith(".git")) {
        remote = remote.substr(0, remote.length - 4);
    }
    return remote;
}

function addLineNumber(url: string) {
    const editor = window.activeTextEditor!;
    const line = editor.selection.active.line + 1;
    return `${url}#L${line}`;
}