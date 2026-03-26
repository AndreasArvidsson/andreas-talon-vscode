import type { Range, TextDocument } from "vscode";
import type { API, Remote, Repository } from "../typings/git";
import { getActiveFileSchemaEditor } from "../util/getActiveEditor";
import { getGitExtension } from "../util/getExtension";

export type GitParameters = {
    useSelection: boolean;
    useBranch: boolean;
};

let _gitApi: API;

async function gitApi(): Promise<API> {
    if (_gitApi == null) {
        const gitExtension = await getGitExtension();
        _gitApi = gitExtension.getAPI(1);
    }
    return _gitApi;
}

export class GitUtil {
    async getFileURL({
        useSelection = false,
        useBranch = false,
    }: GitParameters): Promise<string> {
        const { document, selections } = getActiveFileSchemaEditor();
        const repository = await this.getRepository();
        const platform = getPlatform(repository);
        const relativeFilePath = getRelativeFilepath(
            repository,
            document.uri.path,
        );
        const range = useSelection ? selections[0] : undefined;
        const commitOrBranch = useBranch
            ? getBranch(repository)
            : getCommit(repository);

        // If we're going to use the commit sha there can't be any changes
        if (!useBranch) {
            validateUnchangedDocument(document, repository);
        }

        // We can only do your URL to a single range of lines
        if (useSelection && selections.length > 1) {
            throw new Error("Can't get Git file URL with multiple selections");
        }

        return platform.getFileUrl(commitOrBranch, relativeFilePath, range);
    }

    async getRepoURL(): Promise<string> {
        const repository = await this.getRepository();
        return getPlatform(repository).getRepoUrl();
    }

    async getIssuesURL(): Promise<string> {
        const repository = await this.getRepository();
        return getPlatform(repository).getIssuesUrl();
    }

    async getNewIssueURL(): Promise<string> {
        const repository = await this.getRepository();
        return getPlatform(repository).getNewIssueUrl();
    }

    async getPullRequestsURL(): Promise<string> {
        const repository = await this.getRepository();
        return getPlatform(repository).getPullRequestsURL();
    }

    async checkout(branches: string[]) {
        const repository = await this.getRepository();
        const branch = await this.getFirstAvailableBranch(branches, repository);
        if (branch == null) {
            throw new Error(
                `Can't checkout unknown branch '${branches.join(", ")}'`,
            );
        }
        await repository.checkout(branch);
    }

    async getFirstAvailableBranch(
        branches: string[],
        repository?: Repository,
    ): Promise<string | undefined> {
        repository ??= await this.getRepository();
        for (const branchName of branches) {
            try {
                await repository.getBranch(branchName);
                return branchName;
            } catch (_error) {
                // Try the next branch
            }
        }
        return undefined;
    }

    private async getRepository(): Promise<Repository> {
        const { repositories } = await gitApi();

        if (repositories.length === 1) {
            return repositories[0];
        }

        if (repositories.length === 0) {
            throw new Error("No git repositories available");
        }

        const { document } = getActiveFileSchemaEditor();
        const filePath = document.uri.path.toLowerCase();
        const repository = repositories
            .filter((r) => {
                const rootPath = r.rootUri.path
                    .toLowerCase()
                    .replace(/\/+$/, "");
                return (
                    filePath === rootPath || filePath.startsWith(`${rootPath}/`)
                );
            })
            .toSorted(
                (a, b) => b.rootUri.path.length - a.rootUri.path.length,
            )[0];

        if (repository == null) {
            throw new Error(`Can't find Git repository for file: ${filePath}`);
        }

        return repository;
    }
}

function getRelativeFilepath(repository: Repository, filePath: string) {
    return filePath.slice(repository.rootUri.path.length + 1);
}

function validateUnchangedDocument(
    document: TextDocument,
    repository: Repository,
) {
    if (document.uri.scheme !== "file") {
        throw new Error("Document scheme is not file");
    }
    if (document.isDirty) {
        throw new Error("Document contains unsaved changes");
    }

    const changes = [
        ...repository.state.workingTreeChanges,
        ...repository.state.indexChanges,
        ...repository.state.mergeChanges,
    ];
    const hasGitChange = changes.some((c) => c.uri.path === document.uri.path);
    if (hasGitChange) {
        throw new Error("Document contains uncommitted Git changes");
    }
}

function getRemote(repository: Repository): Remote {
    const name = repository.state.HEAD?.upstream?.remote;
    if (name == null) {
        throw new Error("Can't find Git remote name");
    }
    const remote = repository.state.remotes.find((r) => r.name === name);
    if (remote == null) {
        throw new Error(`Can't find git remote '${name ?? ""}'`);
    }
    return remote;
}

function getRemoteUrl(repository: Repository) {
    const remote = getRemote(repository);
    const url = remote.fetchUrl ?? remote.pushUrl;
    if (url == null) {
        throw new Error(`Remote '${remote.name}' has no fetch or push url`);
    }
    return url;
}

function getBranch(repository: Repository): string {
    const branch = repository.state.HEAD?.name;
    if (branch == null) {
        throw new Error("Can't find Git branch");
    }
    return branch;
}

function getCommit(repository: Repository): string {
    const commit = repository.state.HEAD?.commit;
    if (commit == null) {
        throw new Error("Can't find Git commit");
    }
    return commit;
}

function cleanGitUrl(url: string) {
    if (url.startsWith("git@")) {
        url = url.replace(":", "/").replace("git@", "https://");
    }
    if (url.endsWith(".git")) {
        url = url.slice(0, -4);
    }
    return url;
}

function getPlatform(repository: Repository): GitPlatform {
    const remoteUrl = getRemoteUrl(repository);
    if (remoteUrl.includes("github.com")) {
        return new Github(remoteUrl);
    }
    if (remoteUrl.includes("bitbucket.org")) {
        return new Bitbucket(remoteUrl);
    }
    throw new Error(`Can't find Git platform for remote url '${remoteUrl}'`);
}

interface GitPlatform {
    name: string;
    getFileUrl(commitOrBranch: string, filePath: string, range?: Range): string;
    getRepoUrl(): string;
    getIssuesUrl(): string;
    getNewIssueUrl(): string;
    getPullRequestsURL(): string;
}

class Github implements GitPlatform {
    name = "GitHub";
    repoUrl: string;

    constructor(remoteUrl: string) {
        this.repoUrl = cleanGitUrl(remoteUrl);
    }

    getFileUrl(
        commitOrBranch: string,
        filePath: string,
        range?: Range,
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
        return `${this.repoUrl}/pulls`;
    }
}

class Bitbucket implements GitPlatform {
    name = "Bitbucket";
    repoUrl: string;

    constructor(remoteUrl: string) {
        this.repoUrl = cleanGitUrl(remoteUrl);
    }

    getFileUrl(
        commitOrBranch: string,
        filePath: string,
        range?: Range,
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
