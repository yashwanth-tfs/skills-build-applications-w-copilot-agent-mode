#!/usr/bin/env node

/**
 * Modify existing Angular projects
 * Adds new components, services, or features to existing Angular applications
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function detectAngularStructure(projectPath) {
    const angularJson = path.join(projectPath, 'angular.json');
    if (!fs.existsSync(angularJson)) {
        throw new Error('Not an Angular project - angular.json not found');
    }
    
    const config = JSON.parse(fs.readFileSync(angularJson, 'utf8'));
    const firstProject = Object.keys(config.projects)[0];
    const isStandalone = config.projects[firstProject]?.schematics?.['@schematics/angular:component']?.standalone !== false;
    
    return {
        isStandalone,
        projectName: firstProject,
        sourceRoot: config.projects[firstProject].sourceRoot || 'src'
    };
}

function addAngularComponent(projectPath, modifications) {
    const structure = detectAngularStructure(projectPath);
    const description = modifications.description || '';
    
    // Extract feature name
    let featureName = 'new-feature';
    if (description.toLowerCase().includes('auth')) {
        featureName = 'auth';
    } else if (description.toLowerCase().includes('user')) {
        featureName = 'user';
    } else if (description.toLowerCase().includes('dashboard')) {
        featureName = 'dashboard';
    }
    
    console.log(`Adding ${featureName} feature...`);
    
    // Create feature module directory
    const featureDir = path.join(projectPath, structure.sourceRoot, 'app/features', featureName);
    fs.mkdirSync(path.join(featureDir, 'components'), { recursive: true });
    
    // Create feature module
    const moduleContent = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ${capitalizeFirst(featureName)}Component } from './components/${featureName}/${featureName}.component';

const routes: Routes = [
  { path: '', component: ${capitalizeFirst(featureName)}Component }
];

@NgModule({
  declarations: [${capitalizeFirst(featureName)}Component],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ${capitalizeFirst(featureName)}Module { }
`;
    
    fs.writeFileSync(path.join(featureDir, `${featureName}.module.ts`), moduleContent);
    console.log(`✓ Created ${featureName}.module.ts`);
    
    // Create component directory
    const componentDir = path.join(featureDir, 'components', featureName);
    fs.mkdirSync(componentDir, { recursive: true });
    
    // Create component TypeScript
    const componentTs = `import { Component, OnInit } from '@angular/core';
import { ${capitalizeFirst(featureName)}Service } from '../../services/${featureName}.service';

@Component({
  selector: 'app-${featureName}',
  templateUrl: './${featureName}.component.html',
  styleUrls: ['./${featureName}.component.scss'],
  standalone: ${structure.isStandalone}
})
export class ${capitalizeFirst(featureName)}Component implements OnInit {
  
  constructor(private ${featureName}Service: ${capitalizeFirst(featureName)}Service) {}
  
  ngOnInit(): void {
    // Component initialization
  }
}
`;
    
    fs.writeFileSync(path.join(componentDir, `${featureName}.component.ts`), componentTs);
    console.log(`✓ Created ${featureName}.component.ts`);
    
    // Create component HTML
    const componentHtml = `<!-- ${capitalizeFirst(featureName)} Component -->
<div class="${featureName}-container">
  <h1>${capitalizeFirst(featureName)}</h1>
  
  <!-- Using Komodo components -->
  <!-- <komodo-card>
    <komodo-card-header>
      <h2>${capitalizeFirst(featureName)} Details</h2>
    </komodo-card-header>
    <komodo-card-content>
      <p>Add your ${featureName} content here</p>
    </komodo-card-content>
  </komodo-card> -->
</div>
`;
    
    fs.writeFileSync(path.join(componentDir, `${featureName}.component.html`), componentHtml);
    console.log(`✓ Created ${featureName}.component.html`);
    
    // Create component SCSS
    const componentScss = `.${featureName}-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 24px;
    color: #1976d2;
  }
}
`;
    
    fs.writeFileSync(path.join(componentDir, `${featureName}.component.scss`), componentScss);
    console.log(`✓ Created ${featureName}.component.scss`);
    
    // Create service
    createAngularService(projectPath, featureName, structure);
    
    // Update routing
    updateAppRouting(projectPath, featureName, structure);
    
    // Update dependencies if needed
    if (modifications.dependencies && modifications.dependencies.length > 0) {
        updatePackageJson(projectPath, modifications.dependencies);
    }
}

function createAngularService(projectPath, featureName, structure) {
    const servicesDir = path.join(projectPath, structure.sourceRoot, 'app/features', featureName, 'services');
    fs.mkdirSync(servicesDir, { recursive: true });
    
    const serviceContent = `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ${capitalizeFirst(featureName)}Service {
  private apiUrl = \`\${environment.apiUrl}/${featureName}\`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(\`\${this.apiUrl}/\${id}\`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(\`\${this.apiUrl}/\${id}\`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`);
  }
}
`;
    
    fs.writeFileSync(path.join(servicesDir, `${featureName}.service.ts`), serviceContent);
    console.log(`✓ Created ${featureName}.service.ts`);
}

function updateAppRouting(projectPath, featureName, structure) {
    const routingFile = path.join(projectPath, structure.sourceRoot, 'app/app-routing.module.ts');
    
    if (fs.existsSync(routingFile)) {
        let content = fs.readFileSync(routingFile, 'utf8');
        
        // Add new route
        const newRoute = `  {
    path: '${featureName}',
    loadChildren: () => import('./features/${featureName}/${featureName}.module').then(m => m.${capitalizeFirst(featureName)}Module)
  }`;
        
        // Find the routes array and add new route
        if (!content.includes(`path: '${featureName}'`)) {
            // Insert before the closing bracket of routes array
            content = content.replace(
                /(\];)/,
                `,\n${newRoute}\n$1`
            );
            
            fs.writeFileSync(routingFile, content);
            console.log(`✓ Updated app-routing.module.ts with ${featureName} route`);
        }
    }
}

function updatePackageJson(projectPath, dependencies) {
    const packageFile = path.join(projectPath, 'package.json');
    
    if (fs.existsSync(packageFile)) {
        const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
        
        dependencies.forEach(dep => {
            if (dep && !dep.startsWith('Python:')) {
                const [name, version] = dep.split('@');
                if (name && !packageJson.dependencies[name]) {
                    packageJson.dependencies[name] = version || 'latest';
                }
            }
        });
        
        fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2));
        console.log(`✓ Updated package.json with new dependencies`);
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function main() {
    if (process.argv.length < 3) {
        console.error('Usage: modify-angular.js <modifications.json>');
        process.exit(1);
    }
    
    const modificationsFile = process.argv[2];
    const modifications = JSON.parse(fs.readFileSync(modificationsFile, 'utf8'));
    
    const projectPath = process.cwd();
    
    console.log('Detected Angular project');
    console.log(`Applying modifications: ${modifications.modification_type}`);
    
    try {
        addAngularComponent(projectPath, modifications);
        console.log('\n✅ Modifications applied successfully');
    } catch (error) {
        console.error('❌ Error applying modifications:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { addAngularComponent, updateAppRouting };
