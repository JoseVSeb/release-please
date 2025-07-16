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

import {Repository} from '../repository';
import {PullRequest} from '../pull-request';
import {Commit} from '../commit';
import {ReleasePullRequest} from '../release-pull-request';
import {Release} from '../release';
import {Logger} from 'code-suggester/build/src/types';
import {GitHubFileContents} from '@google-automations/git-file-utils';

export interface GitProviderOptions {
  repository: Repository;
  logger?: Logger;
}

export interface GitProviderCreateOptions {
  owner: string;
  repo: string;
  token?: string;
  defaultBranch?: string;
  logger?: Logger;
}

export interface CommitFilter {
  (commit: Commit): boolean;
}

export interface CommitIteratorOptions {
  maxResults?: number;
  backfillFiles?: boolean;
}

export interface ReleaseIteratorOptions {
  maxResults?: number;
}

export interface TagIteratorOptions {
  maxResults?: number;
}

export interface ReleaseOptions {
  draft?: boolean;
  prerelease?: boolean;
}

export interface GitProviderRelease {
  id: number;
  name?: string;
  tagName: string;
  sha: string;
  notes?: string;
  url: string;
  draft?: boolean;
  uploadUrl?: string;
}

export interface GitProviderTag {
  name: string;
  sha: string;
}

/**
 * Abstract interface for git providers (GitHub, GitLab, Bitbucket, etc.)
 * This interface defines the contract that all git provider implementations must follow.
 */
export interface GitProvider {
  readonly repository: Repository;

  /**
   * Returns the list of commits to the default branch after the provided filter
   * query has been satisfied.
   */
  commitsSince(
    targetBranch: string,
    filter: CommitFilter,
    options?: CommitIteratorOptions
  ): Promise<Commit[]>;

  /**
   * Iterate through commit history with a max number of results scanned.
   */
  mergeCommitIterator(
    targetBranch: string,
    options?: CommitIteratorOptions
  ): AsyncIterable<Commit>;

  /**
   * Create or update a pull request.
   */
  createOrUpdateReleasePullRequest(
    releasePullRequest: ReleasePullRequest,
    targetBranch: string,
    options?: {
      signoffUser?: string;
      fork?: boolean;
      skipLabeling?: boolean;
    }
  ): Promise<PullRequest>;

  /**
   * Get the contents of a file from the repository.
   */
  getFileContentsOnBranch(
    filename: string,
    branch: string
  ): Promise<GitHubFileContents>;

  /**
   * Get the contents of a file from the default branch.
   */
  getFileContents(filename: string): Promise<GitHubFileContents>;

  /**
   * Create a release.
   */
  createRelease(
    release: Release,
    options?: ReleaseOptions
  ): Promise<GitProviderRelease>;

  /**
   * Add labels to a pull request.
   */
  addIssueLabels(labels: string[], issue: number): Promise<void>;

  /**
   * Remove labels from a pull request.
   */
  removeIssueLabels(labels: string[], issue: number): Promise<void>;
}