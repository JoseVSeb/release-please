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

import {GitProvider, GitProviderCreateOptions} from './git-provider';
import {GitHubProvider, GitHubProviderCreateOptions} from './github-provider';
import {GitLabProvider, GitLabProviderCreateOptions} from './gitlab-provider';
import {ConfigurationError} from '../errors';

export type SupportedProvider = 'github' | 'gitlab' | 'bitbucket';

export interface ProviderFactoryOptions extends GitProviderCreateOptions {
  provider?: SupportedProvider;
  // GitHub-specific options
  apiUrl?: string;
  graphqlUrl?: string;
  proxy?: {
    host: string;
    port: number;
  };
  fetch?: Function;
  // GitLab-specific options
  gitlabUrl?: string;
  privateToken?: string;
  // Future: Bitbucket-specific options
  // bitbucketUrl?: string;
}

/**
 * Factory for creating git provider instances based on provider type.
 */
export class ProviderFactory {
  /**
   * Create a git provider instance based on the specified provider type.
   * Defaults to GitHub if no provider is specified.
   */
  static async create(options: ProviderFactoryOptions): Promise<GitProvider> {
    const provider = options.provider || 'github';

    switch (provider) {
      case 'github':
        return this.createGitHubProvider(options);
      case 'gitlab':
        return this.createGitLabProvider(options);
      case 'bitbucket':
        throw new ConfigurationError(
          'Bitbucket provider is not yet implemented. Please use GitHub provider or contribute a Bitbucket implementation.',
          'GitProvider',
          `${options.owner}/${options.repo}`
        );
      default:
        throw new ConfigurationError(
          `Unsupported provider: ${provider}. Supported providers are: github, gitlab, bitbucket`,
          'GitProvider',
          `${options.owner}/${options.repo}`
        );
    }
  }

  /**
   * Create a GitHub provider instance.
   */
  private static async createGitHubProvider(
    options: ProviderFactoryOptions
  ): Promise<GitHubProvider> {
    const githubOptions: GitHubProviderCreateOptions = {
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

    return GitHubProvider.create(githubOptions);
  }

  /**
   * Create a GitLab provider instance.
   */
  private static async createGitLabProvider(
    options: ProviderFactoryOptions
  ): Promise<GitLabProvider> {
    const gitlabOptions: GitLabProviderCreateOptions = {
      owner: options.owner,
      repo: options.repo,
      token: options.token,
      defaultBranch: options.defaultBranch,
      gitlabUrl: options.gitlabUrl,
      privateToken: options.privateToken,
      logger: options.logger,
    };

    return GitLabProvider.create(gitlabOptions);
  }

  /**
   * Get the list of supported providers.
   */
  static getSupportedProviders(): SupportedProvider[] {
    return ['github', 'gitlab', 'bitbucket'];
  }

  /**
   * Check if a provider is supported.
   */
  static isProviderSupported(provider: string): provider is SupportedProvider {
    return this.getSupportedProviders().includes(provider as SupportedProvider);
  }
}