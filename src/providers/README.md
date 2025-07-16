# Git Provider Architecture

This directory contains the pluggable git provider architecture for release-please. This allows the tool to support multiple git hosting providers beyond just GitHub.

## Overview

The architecture consists of:

- **GitProvider Interface**: Defines the contract all providers must implement
- **Provider Implementations**: Specific implementations for each git hosting service
- **ProviderFactory**: Creates provider instances based on configuration
- **Backward Compatibility**: Existing GitHub-based code continues to work unchanged

## Quick Start

```bash
# Test the new provider architecture
release-please provider-info --repo-url https://github.com/owner/repo --provider github --token $GITHUB_TOKEN

# Use with GitLab (skeleton implementation)
release-please provider-info --repo-url https://gitlab.com/owner/repo --provider gitlab --token $GITLAB_TOKEN
```

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
- **Status**: 🏗️ Foundational Implementation
- **Implementation**: `BitbucketProvider` (foundational structure with authentication)
- **Configuration**: Requires `--token` (Bitbucket OAuth token) or `--username` and `--app-password`
- **Optional**: `--bitbucket-url` for custom Bitbucket instances
- **TODO**: Implement actual Bitbucket API integration

## Implementation Status

This implementation provides:

✅ **Pluggable Architecture**: Clean separation of provider-specific logic  
✅ **Backward Compatibility**: All existing functionality preserved  
✅ **GitHub Provider**: Full implementation wrapping existing GitHub class  
✅ **GitLab Provider**: Skeleton implementation with proper validation  
✅ **Bitbucket Provider**: Foundational implementation with authentication framework  
✅ **Provider Factory**: Centralized creation with type safety  
✅ **CLI Integration**: Provider selection via `--provider` flag  
✅ **Comprehensive Tests**: Unit and integration tests  
✅ **Documentation**: Complete architecture documentation  

## Architecture Benefits

1. **Minimal Changes**: Existing codebase unchanged, new architecture layered on top
2. **Gradual Migration**: Code can be migrated to use providers incrementally
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Extensibility**: Easy to add new providers (GitLab, Bitbucket, Azure DevOps, etc.)
5. **Testability**: Provider interfaces are easily mockable for testing

## Migration Path

The architecture supports gradual migration:

```typescript
// Phase 1: Use provider factory but access GitHub instance (current)
const provider = await ProviderFactory.create({provider: 'github', ...});
const github = (provider as GitHubProvider).getGitHub();
const manifest = new Manifest(github, ...); // Existing code unchanged

// Phase 2: Update components to accept GitProvider interface
const manifest = new Manifest(provider, ...); // Future enhancement

// Phase 3: Remove GitHub-specific dependencies
// All code uses GitProvider interface, supports all providers
```

## Usage Examples

### CLI Usage

```bash
# Default (GitHub)
release-please release-pr --repo-url https://github.com/owner/repo --token $GITHUB_TOKEN

# GitHub (explicit)
release-please release-pr --repo-url https://github.com/owner/repo --provider github --token $GITHUB_TOKEN

# GitLab
release-please release-pr --repo-url https://gitlab.com/owner/repo --provider gitlab --token $GITLAB_TOKEN

# Bitbucket
release-please release-pr --repo-url https://bitbucket.org/owner/repo --provider bitbucket --token $BITBUCKET_TOKEN

# Bitbucket (with app password)
release-please release-pr --repo-url https://bitbucket.org/owner/repo --provider bitbucket --username myuser --app-password $BITBUCKET_APP_PASSWORD

# Bitbucket (self-hosted)
release-please release-pr --repo-url https://bitbucket.example.com/owner/repo --provider bitbucket --token $BITBUCKET_TOKEN --bitbucket-url https://api.bitbucket.example.com/2.0

# Provider information
release-please provider-info --repo-url https://github.com/owner/repo --provider github --token $TOKEN
```

### Programmatic Usage

```typescript
import {ProviderFactory} from 'release-please/src/providers';

// Create any provider
const provider = await ProviderFactory.create({
  provider: 'github', // or 'gitlab', 'bitbucket'
  owner: 'owner',
  repo: 'repo',
  token: 'access-token',
});

// Use provider interface methods
const commits = await provider.commitsSince('main', filter);
const release = await provider.createRelease(releaseInfo);

// Backward compatibility (GitHub only)
if (provider instanceof GitHubProvider) {
  const github = provider.getGitHub();
  // Use existing GitHub methods
}
```

## Next Steps

To complete the pluggable provider implementation:

1. **Implement GitLab API**: Replace skeleton implementation with actual GitLab API calls
2. **Complete Bitbucket API**: Implement actual Bitbucket API calls in the foundational BitbucketProvider
3. **Add Azure DevOps Provider**: Implement Azure DevOps provider
4. **Update Core Components**: Migrate Manifest, strategies to use GitProvider interface
5. **Enhanced CLI**: Provider-specific help and validation
6. **Authentication**: Provider-specific authentication methods

## Contributing

See the main documentation for adding new providers. The architecture is designed to make adding new providers straightforward while maintaining backward compatibility.