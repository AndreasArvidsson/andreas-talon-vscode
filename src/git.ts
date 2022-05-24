import { TextDocument, window } from "vscode";
import { API, GitExtension, Repository } from "./typings/git";

export default {
    getURL: (gitExtension: GitExtension, lineNumber: boolean) => {
        const api = gitExtension.getAPI(1);
        const document = getDocument();
        const filePath = getFilePath(document);
        const repository = getRepository(api, filePath);
        validateUnchangedDocument(document, repository);
        const remote = getRemote(repository);
        const branch = getBranch(repository);
        const platform = getPlatform(remote);
        const repoPath = repository.rootUri.path;
        const path = filePath.substring(repoPath.length + 1);
        const commit = repository.state.HEAD?.commit;
        const url = toWebPage(platform, remote, branch, path, commit);
        return lineNumber ? addLineNumber(platform, url) : url;
    },
};

function getDocument() {
    const document = window.activeTextEditor?.document;
    if (!document) {
        throw Error("Can't find text document");
    }
    return document;
}

function getFilePath(document: TextDocument) {
    const path = document.uri.path;
    if (!path) {
        throw Error("Can't find file path");
    }
    return path;
}

function validateUnchangedDocument(
    document: TextDocument,
    repository: Repository
) {
    const changes = [
        ...repository.state.workingTreeChanges,
        ...repository.state.indexChanges,
        ...repository.state.mergeChanges,
    ];
    const change = !!changes.find(
        (change) => change.uri.path === document.uri.path
    );
    if (change) {
        throw Error("Uncommitted git changes");
    }
}

const getRepository = (api: API, filePath: string) => {
    const repository = api.repositories.find((r) =>
        filePath.startsWith(r.rootUri.path)
    );
    if (!repository) {
        throw Error("Can't find git repository");
    }
    return repository;
};

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
    throw Error("Can't find git remote");
}

function getBranch(repository: Repository) {
    const branch = repository.state.HEAD?.name;
    if (!branch) {
        throw Error("Can't find git branch");
    }
    return branch;
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

function getPlatform(remote: string): Platform {
    if (remote.includes("github.com")) {
        return "github";
    }
    if (remote.includes("bitbucket.org")) {
        return "bitbucket";
    }
    throw Error("Can't find git platform");
}

type Platform = "github" | "bitbucket";
