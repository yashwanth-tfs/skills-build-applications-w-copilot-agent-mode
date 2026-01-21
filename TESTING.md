# Example: How to Test Locally

## Testing the Issue Templates

1. Go to your repository on GitHub
2. Click "Issues" → "New Issue"
3. You should see:
   - 🐍 Python Project
   - 🅰️ Angular Project

## Testing Code Generation Locally

### Setup
```bash
cd codegen-automator
chmod +x scripts/generate-project.sh
```

### Test Python Generation

1. Create a test metadata file:
```bash
mkdir -p .codegen-metadata
cat > .codegen-metadata/issue-test.json << 'EOF'
{
  "issue_number": 999,
  "project_type": "python",
  "project_name": "test-django-app",
  "branch": "codegen/test-django-app-999",
  "issue_body": "### Project Name\n\ntest-django-app\n\n### Framework\n\nDjango\n\n### Database\n\nSQLite\n\n### Additional Features\n\n- [X] User Authentication\n- [X] REST API\n- [X] Unit Tests\n\n### Project Description\n\nA test Django application"
}
EOF
```

2. Run the Python generator:
```bash
python3 scripts/generate-python.py test-django-app .codegen-metadata/issue-test.json
```

3. Check the output:
```bash
ls -la generated-projects/test-django-app/
```

### Test Angular Generation

1. Create a test metadata file:
```bash
cat > .codegen-metadata/issue-test-ng.json << 'EOF'
{
  "issue_number": 998,
  "project_type": "angular",
  "project_name": "test-angular-app",
  "branch": "codegen/test-angular-app-998",
  "issue_body": "### Project Name\n\ntest-angular-app\n\n### Angular Version\n\nAngular 17 (Latest)\n\n### Styling Framework\n\nSCSS\n\n### Additional Features\n\n- [X] Routing\n- [X] HTTP Client\n- [X] Forms (Reactive & Template-driven)\n\n### Project Structure\n\nStandalone Components (Recommended)\n\n### Project Description\n\nA test Angular application"
}
EOF
```

2. Run the Angular generator:
```bash
node scripts/generate-angular.js test-angular-app .codegen-metadata/issue-test-ng.json
```

3. Check the output:
```bash
ls -la generated-projects/test-angular-app/
```

## Testing the Full Workflow Script

```bash
# Test Python
./scripts/generate-project.sh python 999

# Test Angular
./scripts/generate-project.sh angular 998
```

## Cleanup

```bash
rm -rf generated-projects/test-*
rm .codegen-metadata/issue-test*.json
```

## Validating GitHub Actions (requires push to GitHub)

1. Push your changes:
```bash
git add .
git commit -m "Add CodeGen Automator"
git push
```

2. Create a test issue using one of the templates

3. Monitor the Actions tab to see the workflow execute

4. Check the issue for automated comments

5. Test the `/approve` and `/reject` commands

## Common Issues

### Permission denied on scripts
```bash
chmod +x scripts/*.sh
```

### Python dependencies missing
```bash
pip install jq  # or install jq via package manager
```

### Node.js not installed
```bash
# Install Node.js 20+
# macOS: brew install node
# Ubuntu: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

### Angular CLI not found
```bash
npm install -g @angular/cli
```
