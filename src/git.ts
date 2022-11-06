import { Range, TextDocument, TextEditor, window } from "vscode";
import { API, GitExtension, Repository } from "./typings/git";

let gitApi: API;

export const init = (gitExtension: GitExtension) => {
    gitApi = gitExtension.getAPI(1);
};

export const getFileURL = (lineNumber: boolean) => {
    const { document, selection } = getEditor();
    const filePath = getFilePath(document);
    const repository = getRepository(filePath);
    validateUnchangedDocument(document, repository);
    const platform = getPlatform(repository);

    return platform.getFileUrl(
        getCommit(repository),
        getRelativeFilepath(repository, filePath),
        lineNumber ? selection : undefined
    );
};

export const getRepoURL = () => {
    return getPlatformHelper().getRepoUrl();
};

export const getIssuesURL = () => {
    return getPlatformHelper().getIssuesUrl();
};

export const getNewIssueURL = () => {
    return getPlatformHelper().getNewIssueUrl();
};

export const getPullRequestsURL = () => {
    return getPlatformHelper().getPullRequestsURL();
};

function getPlatformHelper(): Platform {
    const { document } = getEditor();
    const filePath = getFilePath(document);
    const repository = getRepository(filePath);
    return getPlatform(repository);
}

function getRelativeFilepath(repository: Repository, filePath: string) {
    return filePath.substring(repository.rootUri.path.length + 1);
}

function getEditor(): TextEditor {
    const editor = window.activeTextEditor;
    if (!editor) {
        throw Error("Can't find active text editor");
    }
    return editor;
}

function getFilePath(document: TextDocument): string {
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
    if (document.isDirty) {
        throw Error("Document contains unsaved changes");
    }

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

const getRepository = (filePath: string): Repository => {
    const repository = gitApi.repositories.find((r) =>
        filePath.toLowerCase().startsWith(r.rootUri.path.toLowerCase())
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

function getBranch(repository: Repository): string {
    const branch = repository.state.HEAD?.name;
    if (!branch) {
        throw Error("Can't find git branch");
    }
    return branch;
}

function getCommit(repository: Repository): string {
    const commit = repository.state.HEAD?.commit;
    if (!commit) {
        throw Error("Can't find git commit");
    }
    return commit;
}

function remoteToUrl(remote: string) {
    if (remote.startsWith("git@")) {
        remote = remote.replace(":", "/").replace("git@", "https://");
    }
    if (remote.endsWith(".git")) {
        remote = remote.substring(0, remote.length - 4);
    }
    return remote;
}

function getPlatform(repository: Repository): Platform {
    const remote = getRemote(repository);
    if (remote.includes("github.com")) {
        return new Github(remote);
    }
    if (remote.includes("bitbucket.org")) {
        return new Bitbucket(remote);
    }
    throw Error(`Can't find git platform for '${remote}'`);
}

interface Platform {
    name: string;
    getFileUrl(commitOrBranch: string, filePath: string, range?: Range): string;
    getRepoUrl(): string;
    getIssuesUrl(): string;
    getNewIssueUrl(): string;
    getPullRequestsURL(): string;
}

class Github implements Platform {
    name = "GitHub";
    repoUrl: string;

    constructor(remote: string) {
        this.repoUrl = remoteToUrl(remote);
    }

    getFileUrl(
        commitOrBranch: string,
        filePath: string,
        range?: Range
    ): string {
        let url = `${this.repoUrl}/blob/${commitOrBranch}/${filePath}`;

        if (range != null) {
            url = range.isSingleLine
                ? `${url}#L${range.start.line + 1}`
                : `${url}#L${range.start.line + 1}-L${range.end.line + 1}`;
        }

        return url;
    }

    getRepoUrl(): string {
        return this.repoUrl;
    }

    getIssuesUrl(): string {
        return `${this.repoUrl}/issues`;
    }

    getNewIssueUrl(): string {
        return `${this.repoUrl}/issues/new`;
    }

    getPullRequestsURL(): string {
        return `${this.repoUrl}/pulls#`;
    }
}

class Bitbucket implements Platform {
    name = "Bitbucket";
    repoUrl: string;

    constructor(remote: string) {
        this.repoUrl = remoteToUrl(remote);
    }

    getFileUrl(
        commitOrBranch: string,
        filePath: string,
        range?: Range
    ): string {
        let url = `${this.repoUrl}/src/${commitOrBranch}/${filePath}`;

        if (range != null) {
            url = range.isSingleLine
                ? `${url}#lines-${range.start.line + 1}`
                : `${url}#lines-${range.start.line + 1}:${range.end.line + 1}`;
        }

        return url;
    }

    getRepoUrl(): string {
        return this.repoUrl;
    }

    getIssuesUrl(): string {
        return `${this.repoUrl}/issues`;
    }

    getNewIssueUrl(): string {
        return `${this.repoUrl}/issues/new`;
    }

    getPullRequestsURL(): string {
        return `${this.repoUrl}/pull-requests`;
    }
}
