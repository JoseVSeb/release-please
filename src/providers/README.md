# Git Provider Architecture

This directory contains the pluggable git provider architecture for release-please. This allows the tool to support multiple git hosting providers beyond just GitHub.

## Overview

The architecture consists of:

- **GitProvider Interface**: Defines the contract all providers must implement
- **Provider Implementations**: Specific implementations for each git hosting service
- **ProviderFactory**: Creates provider instances based on configuration
- **Backward Compatibility**: Existing GitHub-based code continues to work unchanged

## Supported Providers

### GitHub (Default)
- **Status**: ✅ Fully Implemented
- **Implementation**: `GitHubProvider` (wraps existing `GitHub` class)
- **Configuration**: Uses existing GitHub token and API settings
- **Backward Compatibility**: Yes, all existing functionality preserved

### GitLab
- **Status**: 🏗️ Basic Structure Implemented
- **Implementation**: `GitLabProvider` (skeleton implementation)
- **Configuration**: Requires `--token` (GitLab private token) and optional `--gitlab-url`
- **TODO**: Implement actual GitLab API integration

### Bitbucket
- **Status**: ❌ Not Implemented
- **Implementation**: Planned
- **TODO**: Create `BitbucketProvider` implementation

## Usage

### CLI Usage

```bash
# Default (GitHub)
release-please release-pr --repo-url https://github.com/owner/repo --token $GITHUB_TOKEN

# GitHub (explicit)
release-please release-pr --repo-url https://github.com/owner/repo --provider github --token $GITHUB_TOKEN

# GitLab
release-please release-pr --repo-url https://gitlab.com/owner/repo --provider gitlab --token $GITLAB_TOKEN

# GitLab (self-hosted)
release-please release-pr --repo-url https://gitlab.example.com/owner/repo --provider gitlab --token $GITLAB_TOKEN --gitlab-url https://gitlab.example.com
```

### Provider Information

```bash
# Show provider information and test configuration
release-please provider-info --repo-url https://github.com/owner/repo --provider github --token $TOKEN
```

## Architecture Details

### GitProvider Interface

The `GitProvider` interface defines the core methods that all providers must implement:

```typescript
interface GitProvider {
  readonly repository: Repository;
  
  // Core methods for release-please functionality
  commitsSince(targetBranch: string, filter: CommitFilter, options?: CommitIteratorOptions): Promise<Commit[]>;
  mergeCommitIterator(targetBranch: string, options?: CommitIteratorOptions): AsyncIterable<Commit>;
  createOrUpdateReleasePullRequest(releasePullRequest: ReleasePullRequest, targetBranch: string, options?: any): Promise<PullRequest>;
  getFileContents(filename: string): Promise<GitHubFileContents>;
  getFileContentsOnBranch(filename: string, branch: string): Promise<GitHubFileContents>;
  createRelease(release: Release, options?: ReleaseOptions): Promise<GitProviderRelease>;
  addIssueLabels(labels: string[], issue: number): Promise<void>;
  removeIssueLabels(labels: string[], issue: number): Promise<void>;
}
```

### ProviderFactory

The `ProviderFactory` creates provider instances based on the provider type:

```typescript
const provider = await ProviderFactory.create({
  provider: 'github', // or 'gitlab', 'bitbucket'
  owner: 'owner',
  repo: 'repo',
  token: 'access-token',
  // Provider-specific options...
});
```

### Backward Compatibility

The `GitHubProvider` wraps the existing `GitHub` class and provides a `getGitHub()` method for backward compatibility:

```typescript
const provider = await ProviderFactory.create({...});
if (provider instanceof GitHubProvider) {
  const github = provider.getGitHub(); // Access original GitHub instance
}
```

## Adding New Providers

To add a new provider (e.g., Bitbucket):

1. **Create the provider class** implementing `GitProvider`:
   ```typescript
   // src/providers/bitbucket-provider.ts
   export class BitbucketProvider implements GitProvider {
     // Implement all GitProvider methods
   }
   ```

2. **Add to the factory**:
   ```typescript
   // src/providers/factory.ts
   case 'bitbucket':
     return this.createBitbucketProvider(options);
   ```

3. **Add provider-specific options** to CLI and interfaces

4. **Add tests** in `test/providers/`

5. **Update documentation**

## Migration Path

The architecture is designed for gradual migration:

1. **Phase 1** (Current): Provider infrastructure with GitHub wrapper
2. **Phase 2**: Migrate core components to use GitProvider interface
3. **Phase 3**: Implement additional providers (GitLab, Bitbucket)
4. **Phase 4**: Deprecate direct GitHub class usage in favor of providers

## Testing

```bash
# Run provider tests
npm test -- build/test/providers/

# Test provider info command
release-please provider-info --repo-url https://github.com/test/test --provider github --token dummy
```

## Contributing

When contributing to the provider architecture:

1. Follow the existing pattern of other providers
2. Implement the full `GitProvider` interface
3. Add appropriate error handling and validation
4. Include tests for your provider
5. Update documentation