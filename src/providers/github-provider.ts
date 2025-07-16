// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
  GitProvider,
  GitProviderCreateOptions,
  CommitFilter,
  CommitIteratorOptions,
  ReleaseOptions,
  GitProviderRelease,
} from './git-provider';
import {GitHub, GitHubRelease} from '../github';
import {Repository} from '../repository';
import {PullRequest} from '../pull-request';
import {Commit} from '../commit';
import {ReleasePullRequest} from '../release-pull-request';
import {Release} from '../release';
import {Logger} from 'code-suggester/build/src/types';
import {GitHubFileContents} from '@google-automations/git-file-utils';

interface InternalGitHubCreateOptions {
  owner: string;
  repo: string;
  defaultBranch?: string;
  apiUrl?: string;
  graphqlUrl?: string;
  token?: string;
  logger?: Logger;
  proxy?: {
    host: string;
    port: number;
  };
  fetch?: any;
}

export interface GitHubProviderCreateOptions extends GitProviderCreateOptions {
  apiUrl?: string;
  graphqlUrl?: string;
  proxy?: {
    host: string;
    port: number;
  };
  fetch?: Function;
}

/**
 * GitHub implementation of the GitProvider interface.
 * This wraps the existing GitHub class to implement the pluggable provider interface.
 */
export class GitHubProvider implements GitProvider {
  private github: GitHub;

  constructor(github: GitHub) {
    this.github = github;
  }

  /**
   * Get the underlying GitHub instance for backward compatibility.
   * This allows existing code that expects a GitHub instance to continue working.
   */
  getGitHub(): GitHub {
    return this.github;
  }

  /**
   * Create a new GitHubProvider instance.
   */
  static async create(
    options: GitHubProviderCreateOptions
  ): Promise<GitHubProvider> {
    const githubOptions: InternalGitHubCreateOptions = {
      owner: options.owner,
      repo: options.repo,
      token: options.token,
      defaultBranch: options.defaultBranch,
      apiUrl: options.apiUrl,
      graphqlUrl: options.graphqlUrl,
      proxy: options.proxy,
      fetch: options.fetch,
      logger: options.logger,
    };

    const github = await GitHub.create(githubOptions);
    return new GitHubProvider(github);
  }

  get repository(): Repository {
    return this.github.repository;
  }

  async commitsSince(
    targetBranch: string,
    filter: CommitFilter,
    options?: CommitIteratorOptions
  ): Promise<Commit[]> {
    return this.github.commitsSince(targetBranch, filter, options);
  }

  mergeCommitIterator(
    targetBranch: string,
    options?: CommitIteratorOptions
  ): AsyncIterable<Commit> {
    return this.github.mergeCommitIterator(targetBranch, options);
  }

  async createOrUpdateReleasePullRequest(
    releasePullRequest: ReleasePullRequest,
    targetBranch: string,
    options?: {
      signoffUser?: string;
      fork?: boolean;
      skipLabeling?: boolean;
    }
  ): Promise<PullRequest> {
    return this.github.createReleasePullRequest(
      releasePullRequest,
      targetBranch,
      options
    );
  }

  async getFileContentsOnBranch(
    filename: string,
    branch: string
  ): Promise<GitHubFileContents> {
    return this.github.getFileContentsOnBranch(filename, branch);
  }

  async getFileContents(filename: string): Promise<GitHubFileContents> {
    return this.github.getFileContents(filename);
  }

  async createRelease(
    release: Release,
    options?: ReleaseOptions
  ): Promise<GitProviderRelease> {
    const githubRelease = await this.github.createRelease(release, options);
    return this.convertGitHubRelease(githubRelease);
  }

  async addIssueLabels(labels: string[], issue: number): Promise<void> {
    return this.github.addIssueLabels(labels, issue);
  }

  async removeIssueLabels(labels: string[], issue: number): Promise<void> {
    return this.github.removeIssueLabels(labels, issue);
  }

  /**
   * Convert GitHub-specific release format to generic provider format.
   */
  private convertGitHubRelease(githubRelease: GitHubRelease): GitProviderRelease {
    return {
      id: githubRelease.id,
      name: githubRelease.name,
      tagName: githubRelease.tagName,
      sha: githubRelease.sha,
      notes: githubRelease.notes,
      url: githubRelease.url,
      draft: githubRelease.draft,
      uploadUrl: githubRelease.uploadUrl,
    };
  }
}