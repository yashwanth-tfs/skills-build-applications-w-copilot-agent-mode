#!/usr/bin/env node

/**
 * Parse modification request from issue metadata
 * Extracts modification details for existing projects
 */

const fs = require('fs');

function parseModificationRequest(issueBody) {
    const modifications = {
        target_repo: '',
        project_type: '',
        modification_type: '',
        description: '',
        files_to_create: [],
        files_to_modify: [],
        dependencies: []
    };
    
    // Extract target repository
    const targetRepoMatch = issueBody.match(/\*\*Target Repository\*\*[:\s]*([^\n]+)/i);
    if (targetRepoMatch) {
        modifications.target_repo = targetRepoMatch[1].trim();
    }
    
    // Extract project type
    const projectTypeMatch = issueBody.match(/\*\*Project Type\*\*[:\s]*([^\n]+)/i);
    if (projectTypeMatch) {
        modifications.project_type = projectTypeMatch[1].trim();
    }
    
    // Extract modification type
    const modTypeMatch = issueBody.match(/\*\*Modification Type\*\*[:\s]*([^\n]+)/i);
    if (modTypeMatch) {
        modifications.modification_type = modTypeMatch[1].trim();
    }
    
    // Extract description
    const descMatch = issueBody.match(/\*\*Description\*\*[:\s]*\n([^#]+?)(?=\n\*\*|$)/is);
    if (descMatch) {
        modifications.description = descMatch[1].trim();
    }
    
    // Extract files to create/modify
    const filesMatch = issueBody.match(/\*\*Files to Modify\/Create\*\*[:\s]*\n([^#]+?)(?=\n\*\*|$)/is);
    if (filesMatch) {
        const filesText = filesMatch[1];
        
        // Parse Create: section
        const createMatch = filesText.match(/Create:[^\n]*\n((?:[-*]\s+.+\n?)+)/i);
        if (createMatch) {
            modifications.files_to_create = createMatch[1]
                .split('\n')
                .map(line => line.replace(/^[-*]\s+/, '').trim())
                .filter(line => line.length > 0);
        }
        
        // Parse Modify: section
        const modifyMatch = filesText.match(/Modify:[^\n]*\n((?:[-*]\s+.+\n?)+)/i);
        if (modifyMatch) {
            modifications.files_to_modify = modifyMatch[1]
                .split('\n')
                .map(line => line.replace(/^[-*]\s+/, '').trim())
                .filter(line => line.length > 0);
        }
    }
    
    // Extract dependencies
    const depsMatch = issueBody.match(/\*\*New Dependencies\*\*[:\s]*\n([^#]+?)(?=\n\*\*|$)/is);
    if (depsMatch) {
        const depsText = depsMatch[1];
        modifications.dependencies = depsText
            .split('\n')
            .map(line => line.replace(/^[-*]\s+/, '').trim())
            .filter(line => line.length > 0 && !line.match(/^(Python|Angular|npm):/i));
    }
    
    return modifications;
}

function main() {
    if (process.argv.length < 3) {
        console.error('Usage: parse-modification-request.js <metadata_file>');
        process.exit(1);
    }
    
    const metadataFile = process.argv[2];
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    const modifications = parseModificationRequest(metadata.issue_body);
    
    console.log(JSON.stringify(modifications, null, 2));
}

if (require.main === module) {
    main();
}

module.exports = { parseModificationRequest };
