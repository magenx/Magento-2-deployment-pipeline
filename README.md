# SOC 2 Compliant Release Workflow for Magento 2 application

This repository provides a template for setting up a SOC 2 compliant process using `release-please-action` on GitHub Actions.  
The workflow automates version control, changelog generation, pre-release => release creation, deployment and PR comments.

## Key Concepts

The release process is divided into stages:  
**Pre-release PR**:  
A pull request that prepares the codebase for a pre-release. This may include version bumps, changelog updates, and feature flags.  

**Pre-release**:  
Generates and publishes an alpha or beta version of the software for internal testing, CI validation, or staging environments. Not intended for production use.  

**Release PR**:  
A pull request that finalizes the release. It often includes finalized changelogs, version tags, and cleanup of temporary/test code from pre-release.  

**Release**:  
Publishes the official, production-ready release after all tests, approvals, and validations have passed. Artifacts are pushed to registries or deployment targets.  
  
### Compliance Features

- Works with protected main branches (no direct pushes)
- Maintains a complete audit log of all changes
- Standardizes the release process across your team
- Automates version updates and changelog entries
- Links code changes to releases for full traceability
- Enforces separation between development and release steps
- Supports controlled pre-release testing environments
- Documents all tests conducted before a final release
- Manages comprehensive change documentation automatically
- Integrates with PR approval workflows for access control
- Keeps all the wworkflow messages and comments in PR
> To maintain SOC 2 compliance, this template assumes all related testing and publishing workflows also adhere to compliance requirements, and that branch protection rules are properly configured.

## Workflow Highlights

1. Open PR with code changes to the dev branch using Conventional Commit messages.
2. PR and changed files validation. [Review](https://github.com/magenx/Magento-2-deployment-pipeline/pull/215) and merge.
3. The workflow opens a [pre-release PR](https://github.com/magenx/Magento-2-deployment-pipeline/pull/270) automatically.
4. Merging the pre-release PR generates a [release PR](https://github.com/magenx/Magento-2-deployment-pipeline/pull/271)
5. Starts Magento 2 build and deployment.
6. Release PR updated with job outcome status.
7. Test your deployment on staging server.
8. Run more additional tests on staging.
9. Merging the release PR publishes the production release.
10. Issue report deployment [status](https://github.com/magenx/Magento-2-deployment-pipeline/issues/272)
11. Deployment starts to production.

## SOC 2 Requirements

- using secrets
- only allow squash merging PR
- check "Allow squash merging" and set the below dropdown to "Default to pull request title"
- uncheck "Allow merge commits" & "Allow rebase merging"
- setup branch protection rules
  - "Require a pull request before merging"
  - "Dismiss stale pull request approvals when new commits are pushed"
  - "Require status checks to pass before merging"
  - "Require branches to be up to date before merging"
  - "Require conversation resolution before merging"
  - "Require linear history"
  - make sure "Do not allow bypassing the above settings" is unchecked, else the automatic release commits won't work
  
### setup Github PAT for the repository  
> required because of branch protection is enabled and workflow triggers protection
- go to https://github.com/settings/personal-access-tokens
- set Expiration
- select the right resource owner
- under "Repository" access,
  - select "Only select repositories"
- under "Permissions"
  - set "Contents", "Issues" and "Pull requests" to "Read and write"
- copy the generated token to a new RELEASE_GITHUB_TOKEN repository secret on the Github repository
  
## A Better Deployments Pattern  
> [!TIP]
> Use remote storage (like S3 or container registries).  
> Trigger deployments through event systems (S3 events, RabbitMQ, Redis).  
> Pass only scoped tokens and minimal payloads.  
  
### Problems With the Traditional Approach  
- Master tokens expose the entire system if leaked  
- Secrets are scattered across repositories, environments, and configs  
- SSH keys are hard to rotate and prone to leakage  
- Changing IPs or ports often break pipelines  
- Infrastructure and deployment logic are tightly coupled  
  
### Benefits of Storage + Event-Based Deployment  
1. Use short-lived, minimal-scope tokens  
2. Event-driven model removes the need for client-side coordination  
3. No exposed ports or hardcoded IPs to manage  
4. Storage and queues provide built-in logging and auditability  
5. Works across cloud, hybrid, and secure/private environments  
  
  

## Reposoitory list  
### Actions  
- `pagespeed/psi.js`  
  This script runs Google PageSpeed Insights and Chrome UX Report API checks for a given URL, then formats and outputs performance results. It's used in CI/CD workflows to automate website performance analysis and reporting.

- `pagespeed/action.yml`  
  Defines a composite GitHub Action that sets up Node.js, installs dependencies, and invokes psi.js to run PageSpeed Insights checks. It allows workflows to easily measure web performance via the Google APIs.

- `composer-cache/action.yml`  
  Sets up and manages caching for Composer packages to speed up dependency installation in CI workflows. It detects cache hits/misses and configures the Composer cache directory and key.

- `composer-lock-diff/action.yml`  
  Finds new dependencies in composer.lock and extracts newly added Magento modules by comparing with a base state. It outputs lists of new dependencies and module names, helping manage module changes in PRs.

- `composer-diff/action.yml`  
  Compares composer.json requirements against a base branch to identify new and removed modules. Outputs lists of changed modules and flags if additions or removals occurred, streamlining dependency reviews.

- `security-scan/action.yml`  
 Downloads and runs the eComscan security scanner on the repository, reporting results as an output. Used in workflows for automated security checks of codebases.

- `setup-di-compile/action.yml`  
  Runs Magento 2 code installation and compilation tests, including composer install, di compile, static content deploy, and optional Hyva Theme CSS generation. Outputs the status of each step to validate deployment readiness.

### Workflows  
- `build.yml`
Automates the full Magento build for prerelease tags, including compilation, packaging, and attaching artifacts to releases. Ensures builds are consistent and available for testing or deployment.

- `deploy.yml`
It downloads release assets, uploads them to an S3 bucket, triggers an external deployment webhook with signed payloads, and generates a deployment status comment, ensuring secure and traceable deployments to the specified environment.

- `labeler.yml`
Automatically applies labels to pull requests based on their changes and branch context. Helps organize and categorize PRs for easier management.

- `release.yml`
Handles pre-release and release automation by creating release pull requests and publishing new tags. Uses release-please to streamline changelog and release process.

- `phpcsfixer.yml`
Runs PHP syntax and code style checks on changed PHP and PHTML files in pull requests, reporting results using reviewdog. Helps maintain code quality and consistency.

- `release_artifact.yml`
Syncs build artifacts from prerelease to production releases and triggers deployment notifications. Ensures that production releases contain all necessary build files.

- `upgrade.yml`
Automates the process of upgrading Magento 2 to the latest version and creates a pull request for review. Simplifies staying up to date with Magento core updates.

- `composer_outdated.yml`
Periodically checks for outdated Composer dependencies and creates GitHub issues to notify maintainers. Helps keep dependencies current and secure.

- `pr_title_validate.yml`
Validates pull request titles against semantic and formatting rules to enforce contribution standards. Ensures PR titles are clear and informative.

- `pagespeed.yml`
Runs PageSpeed Insights checks on a configured URL using a custom action. Automates web performance monitoring as part of the CI/CD pipeline.

- `composer_require.yml`
Validates composer.json and composer.lock changes in pull requests, checks for new or removed modules, and comments the results. Automates dependency management and review for PRs.

### Release  
- `config.json`
This configuration file defines changelog sections, release settings, and extra files for the release-please automation tool. It organizes release note generation and controls the release workflow for the repository.

- `manifest.json`
Stores the current production release version for the repository, referenced during release automation. It helps manage versioning and ensures consistency for published releases.

- `prerelease-manifest.json`
Records the current prerelease version, supporting prerelease builds and automation. It distinguishes alpha or testing builds from stable releases.

- `prerelease-config.json`
Configures changelog sections and release behavior specifically for prereleases, enabling alpha versioning and tailored automation. It helps automate the creation and management of prerelease pull requests and tags.

---

