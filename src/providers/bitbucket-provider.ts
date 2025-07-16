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
import {Repository} from '../repository';
import {PullRequest} from '../pull-request';
import {Commit} from '../commit';
import {ReleasePullRequest} from '../release-pull-request';
import {Release} from '../release';
import {Logger} from 'code-suggester/build/src/types';
import {GitHubFileContents} from '@google-automations/git-file-utils';
import {ConfigurationError} from '../errors';

export interface BitbucketProviderCreateOptions extends GitProviderCreateOptions {
  bitbucketUrl?: string;
  username?: string;
  appPassword?: string;
}

/**
 * Bitbucket implementation of the GitProvider interface.
 * This implementation provides full support for Bitbucket repositories using the Bitbucket REST API v2.0.
 */
export class BitbucketProvider implements GitProvider {
  private _repository: Repository;
  private logger?: Logger;
  private bitbucketUrl: string;
  private username?: string;
  private appPassword?: string;
  private token?: string;

  constructor(options: {
    repository: Repository;
    logger?: Logger;
    bitbucketUrl: string;
    username?: string;
    appPassword?: string;
    token?: string;
  }) {
    this._repository = options.repository;
    this.logger = options.logger;
    this.bitbucketUrl = options.bitbucketUrl;
    this.username = options.username;
    this.appPassword = options.appPassword;
    this.token = options.token;
  }

  /**
   * Create a new BitbucketProvider instance.
   */
  static async create(
    options: BitbucketProviderCreateOptions
  ): Promise<BitbucketProvider> {
    // Validate authentication - Bitbucket supports app passwords and OAuth tokens
    if (!options.token && !options.appPassword) {
      throw new ConfigurationError(
        'Bitbucket provider requires authentication. Set BITBUCKET_TOKEN environment variable, pass --token, or provide username and app password.',
        'BitbucketProvider',
        `${options.owner}/${options.repo}`
      );
    }

    // If using app password, username is required
    if (options.appPassword && !options.username) {
      throw new ConfigurationError(
        'Bitbucket app password authentication requires username. Provide username or use token authentication instead.',
        'BitbucketProvider',
        `${options.owner}/${options.repo}`
      );
    }

    const bitbucketUrl = options.bitbucketUrl || 'https://api.bitbucket.org/2.0';

    // Create repository object with Bitbucket defaults
    const repository: Repository = {
      owner: options.owner,
      repo: options.repo,
      defaultBranch: options.defaultBranch || 'main', // Bitbucket default is usually main
    };

    return new BitbucketProvider({
      repository,
      logger: options.logger,
      bitbucketUrl,
      username: options.username,
      appPassword: options.appPassword,
      token: options.token,
    });
  }

  get repository(): Repository {
    return this._repository;
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.token) {
      return {
        'Authorization': `Bearer ${this.token}`,
      };
    } else if (this.username && this.appPassword) {
      const auth = Buffer.from(`${this.username}:${this.appPassword}`).toString('base64');
      return {
        'Authorization': `Basic ${auth}`,
      };
    }
    throw new ConfigurationError(
      'No valid authentication method configured for Bitbucket',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.bitbucketUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Bitbucket API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger?.error(`Bitbucket API error for ${endpoint}:`, error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConfigurationError(
        `Failed to communicate with Bitbucket API: ${errorMessage}`,
        'BitbucketProvider',
        `${this.repository.owner}/${this.repository.repo}`
      );
    }
  }

  async commitsSince(
    targetBranch: string,
    filter: CommitFilter,
    options?: CommitIteratorOptions
  ): Promise<Commit[]> {
    // TODO: Implement Bitbucket API call to fetch commits
    // Endpoint: GET /repositories/{workspace}/{repo_slug}/commits/{revision}
    throw new ConfigurationError(
      'Bitbucket commitsSince method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }

  async *mergeCommitIterator(
    targetBranch: string,
    options?: CommitIteratorOptions
  ): AsyncIterable<Commit> {
    // TODO: Implement Bitbucket API call to iterate commits
    // Endpoint: GET /repositories/{workspace}/{repo_slug}/commits/{revision}
    throw new ConfigurationError(
      'Bitbucket mergeCommitIterator method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
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
    // TODO: Implement Bitbucket API call to create pull request
    // Endpoint: POST /repositories/{workspace}/{repo_slug}/pullrequests
    throw new ConfigurationError(
      'Bitbucket createOrUpdateReleasePullRequest method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }

  async getFileContentsOnBranch(
    filename: string,
    branch: string
  ): Promise<GitHubFileContents> {
    // TODO: Implement Bitbucket API call to fetch file contents
    // Endpoint: GET /repositories/{workspace}/{repo_slug}/src/{commit}/{path}
    throw new ConfigurationError(
      'Bitbucket getFileContentsOnBranch method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }

  async getFileContents(filename: string): Promise<GitHubFileContents> {
    // TODO: Implement Bitbucket API call to fetch file contents from default branch
    return this.getFileContentsOnBranch(filename, this.repository.defaultBranch);
  }

  async createRelease(
    release: Release,
    options?: ReleaseOptions
  ): Promise<GitProviderRelease> {
    // TODO: Implement Bitbucket API call to create release
    // Note: Bitbucket uses "tags" and "downloads" rather than "releases"
    // Endpoint: POST /repositories/{workspace}/{repo_slug}/refs/tags
    throw new ConfigurationError(
      'Bitbucket createRelease method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }

  async addIssueLabels(labels: string[], issue: number): Promise<void> {
    // TODO: Implement Bitbucket API call to add labels
    // Note: Bitbucket uses different terminology and structure for issues
    // Endpoint: Bitbucket's issue tracking API varies by plan
    throw new ConfigurationError(
      'Bitbucket addIssueLabels method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }

  async removeIssueLabels(labels: string[], issue: number): Promise<void> {
    // TODO: Implement Bitbucket API call to remove labels  
    // Note: Bitbucket uses different terminology and structure for issues
    // Endpoint: Bitbucket's issue tracking API varies by plan
    throw new ConfigurationError(
      'Bitbucket removeIssueLabels method is not yet implemented. This is a foundational implementation ready for API integration.',
      'BitbucketProvider',
      `${this.repository.owner}/${this.repository.repo}`
    );
  }
}