#!/bin/bash

# Script to generate project based on template type
# Usage: ./generate-project.sh <project_type> <issue_number>

set -e

PROJECT_TYPE=$1
ISSUE_NUMBER=$2
METADATA_FILE=".codegen-metadata/issue-${ISSUE_NUMBER}.json"

echo "==================================="
echo "CodeGen Automator - Project Generator"
echo "==================================="
echo "Project Type: $PROJECT_TYPE"
echo "Issue Number: $ISSUE_NUMBER"
echo "==================================="

# Read metadata
if [ ! -f "$METADATA_FILE" ]; then
    echo "Error: Metadata file not found: $METADATA_FILE"
    exit 1
fi

PROJECT_NAME=$(jq -r '.project_name' "$METADATA_FILE")
ISSUE_BODY=$(jq -r '.issue_body' "$METADATA_FILE")

echo "Project Name: $PROJECT_NAME"
echo ""

# Create generated-projects directory if it doesn't exist
mkdir -p generated-projects

case $PROJECT_TYPE in
    python)
        echo "Generating Python project..."
        python3 scripts/generate-python.py "$PROJECT_NAME" "$METADATA_FILE"
        ;;
    angular)
        echo "Generating Angular project..."
        node scripts/generate-angular.js "$PROJECT_NAME" "$METADATA_FILE"
        ;;
    *)
        echo "Error: Unknown project type: $PROJECT_TYPE"
        exit 1
        ;;
esac

echo ""
echo "==================================="
echo "✅ Project generation complete!"
echo "==================================="
