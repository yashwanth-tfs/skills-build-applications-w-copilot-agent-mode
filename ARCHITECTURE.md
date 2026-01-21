# CodeGen Automator - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                    User creates issue with template
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Issue Templates                        │
│  ┌─────────────────┐              ┌──────────────────┐          │
│  │ Python Project  │              │ Angular Project  │          │
│  │  - Django       │              │  - Version       │          │
│  │  - Flask        │              │  - Styling       │          │
│  │  - FastAPI      │              │  - Features      │          │
│  │  - Database     │              │  - Architecture  │          │
│  │  - Features     │              │  - Features      │          │
│  └─────────────────┘              └──────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                    Issue created with labels
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions: codegen-trigger.yml                 │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Job 1: parse-issue                                       │   │
│  │  - Parse issue body & extract configuration             │   │
│  │  - Create feature branch (codegen/<name>-<number>)      │   │
│  │  - Store metadata in .codegen-metadata/                 │   │
│  │  - Comment on issue with status                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                      │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Job 2: generate-code                                     │   │
│  │  - Checkout feature branch                              │   │
│  │  - Set up Python & Node.js                              │   │
│  │  - Run generate-project.sh                              │   │
│  │  - Commit generated code                                │   │
│  │  - Comment with Codespace link                          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Code Generation Scripts                     │
│                                                                   │
│  generate-project.sh (orchestrator)                              │
│         │                                                         │
│         ├─► generate-python.py                                   │
│         │    - Parse issue metadata                              │
│         │    - Generate Django/Flask/FastAPI structure           │
│         │    - Create requirements.txt                           │
│         │    - Create Docker files (if selected)                 │
│         │    - Create README & .gitignore                        │
│         │                                                         │
│         └─► generate-angular.js                                  │
│              - Parse issue metadata                              │
│              - Generate Angular project (ng new)                 │
│              - Add requested features                            │
│              - Create Docker files (if selected)                 │
│              - Create README                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         GitHub Codespace                         │
│                                                                   │
│  User opens Codespace from branch                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ .devcontainer/                                             │ │
│  │  - Python 3.11 environment                                │ │
│  │  - Node.js 20                                             │ │
│  │  - Angular CLI                                            │ │
│  │  - GitHub CLI                                             │ │
│  │  - Pre-configured ports (3000, 4200, 5000, 8000)         │ │
│  │  - VS Code extensions (Python, Angular, Copilot)         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  User reviews, modifies, and tests the generated code            │
└─────────────────────────────────────────────────────────────────┘
                                │
                    User comments /approve or /reject
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              GitHub Actions: handle-approval.yml                 │
│                                                                   │
│  On /approve:                    On /reject:                     │
│  ┌────────────────────────┐      ┌──────────────────────────┐   │
│  │ - Read metadata        │      │ - Delete feature branch  │   │
│  │ - Create Pull Request  │      │ - Close issue            │   │
│  │ - Link to issue        │      │ - Add rejected label     │   │
│  │ - Add approved label   │      └──────────────────────────┘   │
│  │ - Comment on issue     │                                      │
│  └────────────────────────┘                                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                    (if approved)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                          Pull Request                            │
│                                                                   │
│  - Contains all generated code                                   │
│  - Includes any user modifications from Codespace                │
│  - Links back to original issue                                  │
│  - Ready for review and merge                                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                    Reviewer merges PR
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Main Branch Updated                       │
│                                                                   │
│  New project added to repository!                                │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Issue Templates
- **Location**: `.github/ISSUE_TEMPLATE/`
- **Purpose**: Provide structured forms for users to specify project requirements
- **Format**: YAML with form fields
- **Labels**: Auto-apply labels for workflow triggering

### 2. GitHub Actions Workflows

#### codegen-trigger.yml
- **Trigger**: Issue opened with `auto-generate` label
- **Jobs**:
  - `parse-issue`: Extract configuration from issue
  - `generate-code`: Run generation scripts
  - `wait-for-approval`: Placeholder for user interaction

#### handle-approval.yml
- **Trigger**: Comment on issue containing `/approve` or `/reject`
- **Actions**: Create PR or clean up branch

### 3. Generation Scripts

#### generate-project.sh
- Main orchestrator
- Routes to appropriate generator based on project type
- Manages metadata files

#### generate-python.py
- Parses Python project requirements
- Generates Django/Flask/FastAPI projects
- Creates supporting files (requirements.txt, Dockerfile, etc.)

#### generate-angular.js
- Parses Angular project requirements
- Uses Angular CLI or manual generation
- Adds requested features and dependencies

### 4. Devcontainer Configuration
- **Purpose**: Provide consistent Codespace environment
- **Includes**:
  - Language runtimes (Python, Node.js)
  - Build tools (pip, npm, Angular CLI)
  - VS Code extensions
  - Port forwarding configuration

### 5. Metadata Storage
- **Location**: `.codegen-metadata/issue-{number}.json`
- **Purpose**: Store issue configuration for later use
- **Content**: Project name, type, branch, original issue body

## Data Flow

1. **User Input** → Issue Template
2. **Issue Template** → GitHub Actions (via webhook)
3. **GitHub Actions** → Metadata File + Feature Branch
4. **Generation Scripts** → Generated Project Code
5. **GitHub Actions** → Codespace Link
6. **User** → Review in Codespace
7. **User** → Approval Comment
8. **GitHub Actions** → Pull Request
9. **Reviewer** → Merge to Main

## Security Model

- **Permissions**: Workflows use `GITHUB_TOKEN` with scoped permissions
- **Isolation**: Each generation in separate branch
- **Review**: Human approval required before merge
- **Cleanup**: Rejected branches automatically deleted

## Extensibility Points

1. **Add New Templates**: Create new YAML files in `ISSUE_TEMPLATE/`
2. **Add New Languages**: Create new generator scripts
3. **Customize Generation**: Modify existing generator scripts
4. **Add Validations**: Enhance workflow with checks
5. **Add Notifications**: Integrate with external services

## Performance Considerations

- **Parallel Jobs**: Where possible, jobs run in parallel
- **Caching**: GitHub Actions caching for dependencies
- **Incremental Generation**: Only generate what's needed
- **Codespace Prebuilds**: Can be configured for faster startup

## Error Handling

- **Workflow Level**: Try-catch in GitHub Actions scripts
- **Script Level**: Exit codes and error messages
- **User Communication**: Comments on issue for all status updates
- **Logging**: GitHub Actions logs for debugging

## Future Enhancements

- [ ] Support for more languages (React, Vue, Go, Rust)
- [ ] Database seeding options
- [ ] CI/CD pipeline generation
- [ ] Deployment configuration (AWS, Azure, GCP)
- [ ] Custom template creation via UI
- [ ] Project update workflow (regenerate with new options)
- [ ] Multi-project monorepo support
- [ ] Integration tests for generated projects
