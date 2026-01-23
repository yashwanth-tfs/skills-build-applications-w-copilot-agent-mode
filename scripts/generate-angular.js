#!/usr/bin/env node

/**
 * Angular Project Generator with Komodo Components
 * Generates an Angular project based on issue metadata and reference images
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Try to import OpenAI - gracefully degrade if not available
let OpenAI;
let OPENAI_AVAILABLE = false;
try {
    OpenAI = require('openai');
    OPENAI_AVAILABLE = true;
} catch (error) {
    console.warn('⚠️  OpenAI library not found. AI-powered code generation will be disabled.');
    console.warn('   Install with: npm install openai');
}

/**
 * Generate code using OpenAI API
 * 
 * @param {string} prompt - The generation prompt
 * @param {string} model - Model to use (defaults to env OPENAI_MODEL or 'gpt-4')
 * @param {number} maxTokens - Maximum tokens in response
 * 
 * Environment Variables:
 *   OPENAI_API_KEY: API key for authentication (required)
 *   OPENAI_ENDPOINT: Custom endpoint URL (optional, for Azure OpenAI or custom deployments)
 *   OPENAI_MODEL: Default model to use (optional, defaults to 'gpt-4')
 */
async function generateCodeWithAI(prompt, model = null, maxTokens = 2000) {
    if (!OPENAI_AVAILABLE) {
        console.warn('   ⚠️  OpenAI not available, falling back to template');
        return null;
    }

    // Get configuration from environment
    const apiKey = process.env.OPENAI_API_KEY;
    const endpoint = process.env.OPENAI_ENDPOINT;  // Optional: for Azure OpenAI or custom endpoints
    const defaultModel = process.env.OPENAI_MODEL || 'gpt-4';
    
    if (!apiKey) {
        console.warn('   ⚠️  OPENAI_API_KEY environment variable not set, falling back to template');
        return null;
    }

    // Use provided model or default from environment
    const selectedModel = model || defaultModel;

    try {
        // Create client with custom endpoint if provided
        const clientConfig = { apiKey };
        if (endpoint) {
            clientConfig.baseURL = endpoint;
            console.log(`   🔗 Using custom OpenAI endpoint: ${endpoint}`);
        }
        
        const openai = new OpenAI(clientConfig);
        console.log(`   🤖 Generating code with model: ${selectedModel}`);
        
        const response = await openai.chat.completions.create({
            model: selectedModel,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert Angular developer. Generate clean, production-ready TypeScript/Angular code following best practices. Include proper typing, error handling, and documentation.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: maxTokens
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.warn(`   ⚠️  OpenAI API error: ${error.message}, falling back to template`);
        return null;
    }
}

/**
 * Check for reference images in the project directory
 */
function findReferenceImages(projectDir) {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif'];
    const commonNames = ['ui', 'design', 'mockup', 'screenshot', 'reference', 'wireframe', 
                        'layout', 'home', 'dashboard', 'landing'];
    const referenceImages = [];
    
    try {
        // Check root directory
        if (fs.existsSync(projectDir)) {
            const files = fs.readdirSync(projectDir);
            files.forEach(file => {
                const ext = path.extname(file).toLowerCase();
                const basename = path.basename(file, ext).toLowerCase();
                if (imageExtensions.includes(ext) && commonNames.some(name => basename.includes(name))) {
                    referenceImages.push(path.join(projectDir, file));
                }
            });
        }
        
        // Check images subdirectory
        const imagesDir = path.join(projectDir, 'images');
        if (fs.existsSync(imagesDir)) {
            const imageFiles = fs.readdirSync(imagesDir);
            imageFiles.forEach(file => {
                const ext = path.extname(file).toLowerCase();
                if (imageExtensions.includes(ext)) {
                    referenceImages.push(path.join(imagesDir, file));
                }
            });
        }
    } catch (error) {
        console.warn('Warning: Could not scan for reference images:', error.message);
    }
    
    return referenceImages;
}

function parseIssueBody(issueBody) {
    const config = {
        features: [],
        styling: 'CSS',
        version: 'Angular 17 (Latest)',
        architecture: 'Standalone Components'
    };
    
    // Extract Angular version
    const versionMatch = issueBody.match(/### Angular Version\s*\n\s*(.+)/);
    if (versionMatch) {
        config.version = versionMatch[1].trim();
    }
    
    // Extract styling
    const stylingMatch = issueBody.match(/### Styling Framework\s*\n\s*(.+)/);
    if (stylingMatch) {
        config.styling = stylingMatch[1].trim();
    }
    
    // Extract architecture
    const archMatch = issueBody.match(/### Project Structure\s*\n\s*(.+)/);
    if (archMatch) {
        config.architecture = archMatch[1].trim();
    }
    
    // Extract description
    const descMatch = issueBody.match(/### Project Description\s*\n\s*(.+)/m);
    if (descMatch) {
        config.description = descMatch[1].trim();
    }
    
    // Extract features
    if (issueBody.includes('- [X] Routing') || issueBody.includes('- [x] Routing')) {
        config.features.push('routing');
    }
    if (issueBody.includes('- [X] State Management') || issueBody.includes('- [x] State Management')) {
        config.features.push('ngrx');
    }
    if (issueBody.includes('- [X] HTTP Client') || issueBody.includes('- [x] HTTP Client')) {
        config.features.push('http');
    }
    if (issueBody.includes('- [X] Forms') || issueBody.includes('- [x] Forms')) {
        config.features.push('forms');
    }
    if (issueBody.includes('- [X] Authentication') || issueBody.includes('- [x] Authentication')) {
        config.features.push('auth');
    }
    if (issueBody.includes('- [X] Unit Tests') || issueBody.includes('- [x] Unit Tests')) {
        config.features.push('tests');
    }
    if (issueBody.includes('- [X] E2E Tests') || issueBody.includes('- [x] E2E Tests')) {
        config.features.push('e2e');
    }
    if (issueBody.includes('- [X] Docker') || issueBody.includes('- [x] Docker')) {
        config.features.push('docker');
    }
    if (issueBody.includes('- [X] PWA') || issueBody.includes('- [x] PWA')) {
        config.features.push('pwa');
    }
    
    return config;
}

/**
 * Extract entities from project description
 * Similar to Python version but in JavaScript
 */
function extractEntitiesFromDescription(description) {
    const entities = [];
    
    // Common entity keywords to look for
    const entityKeywords = {
        'user': ['user', 'account', 'profile', 'member'],
        'product': ['product', 'item', 'goods', 'merchandise'],
        'order': ['order', 'purchase', 'transaction'],
        'post': ['post', 'article', 'blog'],
        'comment': ['comment', 'review', 'feedback'],
        'task': ['task', 'todo', 'assignment', 'job'],
        'project': ['project', 'workspace'],
        'customer': ['customer', 'client'],
        'invoice': ['invoice', 'bill', 'receipt'],
        'payment': ['payment', 'transaction'],
        'booking': ['booking', 'reservation', 'appointment'],
        'event': ['event', 'meeting', 'conference'],
        'category': ['category', 'tag', 'label'],
        'message': ['message', 'chat', 'conversation'],
        'notification': ['notification', 'alert'],
        'report': ['report', 'analytics', 'statistics'],
        'document': ['document', 'file', 'attachment'],
        'inventory': ['inventory', 'stock', 'warehouse'],
        'employee': ['employee', 'staff', 'worker'],
        'department': ['department', 'division', 'team'],
    };
    
    const descriptionLower = description.toLowerCase();
    
    // Check for each entity keyword with word boundary matching
    for (const [entityName, keywords] of Object.entries(entityKeywords)) {
        for (const keyword of keywords) {
            let pattern;
            if (keyword.endsWith('y')) {
                // For words ending in 'y', match 'categor(y|ies)', 'inventor(y|ies)'
                const base = keyword.slice(0, -1);  // Remove the 'y'
                pattern = new RegExp(`\\b${base}(?:y|ies)\\b`, 'i');
            } else {
                // Match regular plural 's': 'user' matches 'user' or 'users'
                pattern = new RegExp(`\\b${keyword}s?\\b`, 'i');
            }
            
            if (pattern.test(descriptionLower)) {
                if (!entities.includes(entityName)) {
                    entities.push(entityName);
                }
                break;
            }
        }
    }
    
    // If no specific entities found, default to 'item'
    if (entities.length === 0) {
        entities.push('item');
    }
    
    // Limit to first 3 entities to keep code manageable
    return entities.slice(0, 3);
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Proper English pluralization
 */
function pluralize(entity) {
    if (entity.endsWith('y')) {
        return entity.slice(0, -1) + 'ies';
    } else if (entity.endsWith('s')) {
        return entity;
    } else {
        return entity + 's';
    }
}

/**
 * Get a summary of the description (first sentence or max 100 chars)
 */
function getDescriptionSummary(description, maxLength = 100) {
    if (!description) return '';
    
    // Try to get first sentence
    const firstSentence = description.split('.')[0];
    if (firstSentence.length <= maxLength) {
        return firstSentence + '.';
    }
    
    // If first sentence is too long, truncate
    if (description.length <= maxLength) {
        return description;
    }
    
    const truncated = description.substring(0, maxLength);
    return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}

async function generateAngularProject(projectName, config, outputDir, referenceImages) {
    console.log(`Generating Angular project: ${projectName}`);
    
    // Extract entities from description
    config.entities = extractEntitiesFromDescription(config.description || '');
    
    console.log(`Configuration:`, JSON.stringify(config, null, 2));
    
    if (referenceImages.length > 0) {
        console.log(`\n📸 Found ${referenceImages.length} reference image(s):`);
        referenceImages.forEach(img => console.log(`   - ${path.basename(img)}`));
        console.log('   UI will be generated to match these references using Komodo components\n');
    }
    
    const projectPath = path.join(outputDir, projectName);
    
    // Create basic module-based structure (not standalone)
    console.log('Creating module-based Angular project structure...');
    await createModuleBasedStructure(projectPath, projectName, config, referenceImages);
    
    console.log(`✅ Angular project created at ${projectPath}`);
}

async function createModuleBasedStructure(projectPath, projectName, config, referenceImages) {
    console.log('Creating module-based Angular structure with Komodo components...');
    
    const entities = config.entities || ['item'];
    
    // Create directory structure including entity-specific features
    const dirs = [
        'src/app/core/services',
        'src/app/core/interfaces',
        'src/app/shared/components',
        'src/app/shared/directives',
        'src/app/shared/pipes',
        'src/app/layout/header',
        'src/app/layout/footer',
        'src/app/layout/sidebar',
        'src/app/features/home/components',
        'src/assets/images',
        'src/environments',
        'public'
    ];
    
    // Add entity-specific feature directories
    entities.forEach(entity => {
        dirs.push(`src/app/features/${pluralize(entity)}/components`);
        dirs.push(`src/app/features/${pluralize(entity)}/services`);
    });
    
    dirs.forEach(dir => {
        fs.mkdirSync(path.join(projectPath, dir), { recursive: true });
    });
    
    // Copy reference images to assets if they exist
    if (referenceImages.length > 0) {
        const assetsImagesDir = path.join(projectPath, 'src/assets/images');
        referenceImages.forEach(imgPath => {
            const destPath = path.join(assetsImagesDir, path.basename(imgPath));
            try {
                fs.copyFileSync(imgPath, destPath);
                console.log(`   ✓ Copied reference image: ${path.basename(imgPath)}`);
            } catch (error) {
                console.warn(`   ⚠ Could not copy ${path.basename(imgPath)}: ${error.message}`);
            }
        });
    }
    
    // Create package.json with Komodo components
    const packageJson = {
        name: projectName,
        version: '0.0.1',
        scripts: {
            ng: 'ng',
            start: 'ng serve',
            build: 'ng build',
            watch: 'ng build --watch --configuration development',
            test: 'ng test',
            'build:prod': 'ng build --configuration production'
        },
        dependencies: {
            '@angular/animations': '^18.0.0',
            '@angular/common': '^18.0.0',
            '@angular/compiler': '^18.0.0',
            '@angular/core': '^18.0.0',
            '@angular/forms': '^18.0.0',
            '@angular/platform-browser': '^18.0.0',
            '@angular/platform-browser-dynamic': '^18.0.0',
            '@angular/router': '^18.0.0',
            '@business-app-systems/komodo-ui': 'latest',
            'rxjs': '~7.8.0',
            'tslib': '^2.3.0',
            'zone.js': '~0.14.0'
        },
        devDependencies: {
            '@angular-devkit/build-angular': '^18.0.0',
            '@angular/cli': '^18.0.0',
            '@angular/compiler-cli': '^18.0.0',
            '@types/jasmine': '~5.1.0',
            'jasmine-core': '~5.1.0',
            'karma': '~6.4.0',
            'karma-chrome-launcher': '~3.2.0',
            'karma-coverage': '~2.2.0',
            'karma-jasmine': '~5.1.0',
            'karma-jasmine-html-reporter': '~2.1.0',
            'typescript': '~5.4.0'
        }
    };
    
    fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );
    
    // Create angular.json with module-based configuration
    createAngularJson(projectPath, projectName);
    
    // Create tsconfig files
    createTsConfigs(projectPath);
    
    // Create app module structure (module-based, NOT standalone)
    createAppModule(projectPath, projectName, referenceImages);
    
    // Create core module
    createCoreModule(projectPath);
    
    // Create shared module with Komodo components
    createSharedModule(projectPath);
    
    // Create layout module
    createLayoutModule(projectPath, referenceImages);
    
    // Create home feature module
    createHomeModule(projectPath, projectName, config, referenceImages);
    
    // Create environment files
    createEnvironments(projectPath);
    
    // Create main.ts
    createMainTs(projectPath);
    
    // Create styles with Komodo theme
    createStyles(projectPath, referenceImages);
    
    // Create README with Komodo documentation
    createReadme(projectPath, projectName, config, referenceImages);
    
    // Create .gitignore and .editorconfig
    await createConfigFiles(projectPath, config);
    
    // Create Docker files for containerization
    createDockerFiles(projectPath, projectName);
    
    console.log('\n✅ Module-based Angular project with Komodo components created successfully!');
    console.log(`\n📦 Next steps:`);
    console.log(`   cd generated-projects/${projectName}`);
    console.log(`   npm install`);
    console.log(`   npm start`);
    if (referenceImages.length > 0) {
        console.log(`\n📸 Reference images copied to src/assets/images/`);
        console.log(`   UI components generated to match the reference design using Komodo components`);
    }
}

function createAngularJson(projectPath, projectName) {
    const angularJson = {
        "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
        "version": 1,
        "newProjectRoot": "projects",
        "projects": {
            [projectName]: {
                "projectType": "application",
                "schematics": {
                    "@schematics/angular:component": {
                        "style": "scss",
                        "standalone": false
                    },
                    "@schematics/angular:directive": {
                        "standalone": false
                    },
                    "@schematics/angular:pipe": {
                        "standalone": false
                    }
                },
                "root": "",
                "sourceRoot": "src",
                "prefix": "app",
                "architect": {
                    "build": {
                        "builder": "@angular-devkit/build-angular:application",
                        "options": {
                            "outputPath": `dist/${projectName}`,
                            "index": "src/index.html",
                            "browser": "src/main.ts",
                            "polyfills": ["zone.js"],
                            "tsConfig": "tsconfig.app.json",
                            "inlineStyleLanguage": "scss",
                            "assets": [{"glob": "**/*", "input": "public"}],
                            "styles": ["src/styles.scss"],
                            "scripts": []
                        },
                        "configurations": {
                            "production": {
                                "budgets": [
                                    {"type": "initial", "maximumWarning": "2mb", "maximumError": "5mb"},
                                    {"type": "anyComponentStyle", "maximumWarning": "6kb", "maximumError": "10kb"}
                                ],
                                "outputHashing": "all"
                            },
                            "development": {
                                "optimization": false,
                                "extractLicenses": false,
                                "sourceMap": true
                            }
                        },
                        "defaultConfiguration": "production"
                    },
                    "serve": {
                        "builder": "@angular-devkit/build-angular:dev-server",
                        "configurations": {
                            "production": {"buildTarget": `${projectName}:build:production`},
                            "development": {"buildTarget": `${projectName}:build:development`}
                        },
                        "defaultConfiguration": "development"
                    },
                    "test": {
                        "builder": "@angular-devkit/build-angular:karma",
                        "options": {
                            "polyfills": ["zone.js", "zone.js/testing"],
                            "tsConfig": "tsconfig.spec.json",
                            "assets": [{"glob": "**/*", "input": "public"}],
                            "styles": ["src/styles.scss"],
                            "scripts": []
                        }
                    }
                }
            }
        }
    };
    
    fs.writeFileSync(path.join(projectPath, 'angular.json'), JSON.stringify(angularJson, null, 2));
}

function createTsConfigs(projectPath) {
    const tsconfig = {
        "compileOnSave": false,
        "compilerOptions": {
            "outDir": "./dist/out-tsc",
            "strict": true,
            "noImplicitOverride": true,
            "noPropertyAccessFromIndexSignature": true,
            "noImplicitReturns": true,
            "noFallthroughCasesInSwitch": true,
            "skipLibCheck": true,
            "isolatedModules": true,
            "esModuleInterop": true,
            "sourceMap": true,
            "declaration": false,
            "experimentalDecorators": true,
            "moduleResolution": "bundler",
            "importHelpers": true,
            "target": "ES2022",
            "module": "ES2022",
            "lib": ["ES2022", "dom"]
        }
    };
    
    const tsconfigApp = {
        "extends": "./tsconfig.json",
        "compilerOptions": {
            "outDir": "./out-tsc/app",
            "types": []
        },
        "files": ["src/main.ts"],
        "include": ["src/**/*.d.ts"]
    };
    
    const tsconfigSpec = {
        "extends": "./tsconfig.json",
        "compilerOptions": {
            "outDir": "./out-tsc/spec",
            "types": ["jasmine"]
        },
        "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
    };
    
    fs.writeFileSync(path.join(projectPath, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
    fs.writeFileSync(path.join(projectPath, 'tsconfig.app.json'), JSON.stringify(tsconfigApp, null, 2));
    fs.writeFileSync(path.join(projectPath, 'tsconfig.spec.json'), JSON.stringify(tsconfigSpec, null, 2));
}

function createAppModule(projectPath, projectName, referenceImages) {
    const appModuleTs = `import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    LayoutModule
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
`;
    
    const appComponentTs = `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  title = '${projectName}';
}
`;
    
    const appComponentHtml = `<app-layout>
  <router-outlet></router-outlet>
</app-layout>
`;
    
    const appComponentScss = `// App component styles
`;
    
    const appRoutingModule = `import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/app/app.module.ts'), appModuleTs);
    fs.writeFileSync(path.join(projectPath, 'src/app/app.component.ts'), appComponentTs);
    fs.writeFileSync(path.join(projectPath, 'src/app/app.component.html'), appComponentHtml);
    fs.writeFileSync(path.join(projectPath, 'src/app/app.component.scss'), appComponentScss);
    fs.writeFileSync(path.join(projectPath, 'src/app/app-routing.module.ts'), appRoutingModule);
}

function createCoreModule(projectPath) {
    const coreModule = `import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: []
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/app/core/core.module.ts'), coreModule);
}

function createSharedModule(projectPath) {
    const sharedModule = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Import Komodo components as needed
// Example: import { KomodoButtonModule } from '@business-app-systems/komodo-ui';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
    // Add Komodo modules here
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
    // Export Komodo modules here
  ]
})
export class SharedModule { }
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/app/shared/shared.module.ts'), sharedModule);
}

function createLayoutModule(projectPath, referenceImages) {
    const hasReferenceImages = referenceImages.length > 0;
    const refImageComment = hasReferenceImages ? 
        `\n  // Layout designed to match reference images in src/assets/images/\n  // Using Komodo components for consistent UI` : '';
    
    const layoutModule = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [LayoutComponent]
})
export class LayoutModule { }
`;
    
    const layoutComponentTs = `import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  standalone: false${refImageComment}
})
export class LayoutComponent { }
`;
    
    const layoutComponentHtml = `<div class="app-layout">
  <app-header></app-header>
  <main class="main-content">
    <ng-content></ng-content>
  </main>
  <app-footer></app-footer>
</div>
`;
    
    const layoutComponentScss = `/* Layout matching reference design */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
}
`;
    
    const headerComponent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: false
})
export class HeaderComponent {
  // Using Komodo navigation components
}
`;
    
    const headerHtml = `<!-- Header using Komodo components -->
<header class="app-header">
  <nav>
    <h1>Application Header</h1>
    <!-- Add Komodo navigation components here -->
    <!-- Example: <komodo-nav-bar [items]="navItems"></komodo-nav-bar> -->
  </nav>
</header>
`;
    
    const headerScss = `/* Header styles matching reference */
.app-header {
  background-color: #1976d2;
  color: white;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
`;
    
    const footerComponent = `import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false
})
export class FooterComponent { }
`;
    
    const footerHtml = `<footer class="app-footer">
  <p>&copy; 2026 Generated by CodeGen Automator</p>
</footer>
`;
    
    const footerScss = `.app-footer {
  background-color: #f5f5f5;
  padding: 16px;
  text-align: center;
  border-top: 1px solid #ddd;
}
`;
    
    fs.mkdirSync(path.join(projectPath, 'src/app/layout'), {recursive: true});
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/layout.module.ts'), layoutModule);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/layout.component.ts'), layoutComponentTs);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/layout.component.html'), layoutComponentHtml);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/layout.component.scss'), layoutComponentScss);
    
    fs.mkdirSync(path.join(projectPath, 'src/app/layout/header'), {recursive: true});
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/header/header.component.ts'), headerComponent);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/header/header.component.html'), headerHtml);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/header/header.component.scss'), headerScss);
    
    fs.mkdirSync(path.join(projectPath, 'src/app/layout/footer'), {recursive: true});
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/footer/footer.component.ts'), footerComponent);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/footer/footer.component.html'), footerHtml);
    fs.writeFileSync(path.join(projectPath, 'src/app/layout/footer/footer.component.scss'), footerScss);
}

function createHomeModule(projectPath, projectName, config, referenceImages) {
    const hasReferenceImages = referenceImages.length > 0;
    const refComment = hasReferenceImages ? 
        `\n  // UI designed to match reference images using Komodo components\n  // See src/assets/images/ for design references` : '';
    
    const homeModule = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class HomeModule { }
`;
    
    const homeComponent = `import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false${refComment}
})
export class HomeComponent implements OnInit {
  title = '${projectName}';
  description = '${config.description || 'Welcome to your Angular application'}';
  ${hasReferenceImages ? `\n  // Reference images available in assets/images/\n  referenceImages = ${JSON.stringify(referenceImages.map(img => path.basename(img)))};` : ''}

  ngOnInit(): void {
    // Component initialization
  }
}
`;
    
    const homeHtml = `<!-- Home page with Komodo components -->
<div class="home-container">
  <div class="hero-section">
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
    
    <!-- Example Komodo components -->
    <!-- Uncomment and customize as needed -->
    
    <!-- <komodo-card>
      <komodo-card-header>
        <h2>Welcome</h2>
      </komodo-card-header>
      <komodo-card-content>
        <p>Your application content here</p>
      </komodo-card-content>
    </komodo-card> -->
    
    <!-- <komodo-button (click)="onAction()">
      Get Started
    </komodo-button> -->
  </div>
  
  ${hasReferenceImages ? `\n  <!-- UI structure based on reference images -->\n  <div class="content-section">\n    <p>This UI is designed to match the reference images found in src/assets/images/</p>\n    <!-- Add your Komodo components here to match the reference design -->\n  </div>\n  ` : ''}
</div>
`;
    
    const homeScss = `/* Home component styles matching reference design */
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.hero-section {
  text-align: center;
  padding: 48px 24px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 16px;
    color: #1976d2;
  }
  
  p {
    font-size: 1.2rem;
    color: #666;
  }
}

.content-section {
  margin-top: 32px;
  padding: 24px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
`;
    
    fs.mkdirSync(path.join(projectPath, 'src/app/features/home/components/home'), {recursive: true});
    fs.writeFileSync(path.join(projectPath, 'src/app/features/home/home.module.ts'), homeModule);
    fs.writeFileSync(path.join(projectPath, 'src/app/features/home/components/home/home.component.ts'), homeComponent);
    fs.writeFileSync(path.join(projectPath, 'src/app/features/home/components/home/home.component.html'), homeHtml);
    fs.writeFileSync(path.join(projectPath, 'src/app/features/home/components/home/home.component.scss'), homeScss);
}

function createEnvironments(projectPath) {
    const envDev = `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
`;
    
    const envProd = `export const environment = {
  production: true,
  apiUrl: '/api'
};
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/environments/environment.ts'), envDev);
    fs.writeFileSync(path.join(projectPath, 'src/environments/environment.prod.ts'), envProd);
}

function createMainTs(projectPath) {
    const mainTs = `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true
  })
  .catch((err: Error) => console.error(err));
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/main.ts'), mainTs);
    
    // Also create index.html
    const indexHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Angular Application with Komodo Components</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/index.html'), indexHtml);
}

function createStyles(projectPath, referenceImages) {
    const hasReferenceImages = referenceImages.length > 0;
    const refComment = hasReferenceImages ? 
        `\n/* Styles designed to match reference images */\n/* Reference images available in assets/images/ */\n` : '';
    
    const stylesScss = `/* Global styles with Komodo theming */
@import '@business-app-systems/komodo-ui/theming';

${refComment}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  color: #333;
  background-color: #fafafa;
}

/* Komodo theme customization */
/* Add your custom theme variables here */
`;
    
    fs.writeFileSync(path.join(projectPath, 'src/styles.scss'), stylesScss);
}

function createReadme(projectPath, projectName, config, referenceImages) {
    const hasReferenceImages = referenceImages.length > 0;
    const refSection = hasReferenceImages ? `

## Reference Images

This project includes UI reference images that guided the design:
${referenceImages.map(img => `- \`${path.basename(img)}\` (copied to src/assets/images/)`).join('\n')}

The UI components were generated using **Komodo Components** to match these reference designs.
` : '';
    
    const entitiesSection = config.entities && config.entities.length > 0 
        ? `\n## Detected Entities\n\n${config.entities.map(entity => `- **${capitalize(entity)}** - Feature module at \`src/app/features/${pluralize(entity)}/\``).join('\n')}\n`
        : '';
    
    const readme = `# ${projectName}

${getDescriptionSummary(config.description) || 'Angular application with Komodo UI components'}
${refSection}${entitiesSection}
## Komodo Components

This project uses **@business-app-systems/komodo-ui** components.

**Komodo Component Library**: https://main--6871820252f4f69a29390192.chromatic.com/

Available components include:
- Accordion
- Button
- Card
- Dialog
- Form Controls
- Navigation
- Table
- And many more...

## Features

${config.features.length > 0 ? config.features.map(f => `- ${f}`).join('\n') : '- Module-based architecture\n- Komodo UI components\n- SCSS styling\n- Routing'}

## Prerequisites

- Node.js 18+
- npm 9+
- Angular CLI 18+

## Installation

\`\`\`bash
npm install
\`\`\`

## Development

\`\`\`bash
npm start
\`\`\`

Navigate to \`http://localhost:4200/\`

## Build

\`\`\`bash
# Production build
npm run build:prod

# Development build
npm run build
\`\`\`

## Project Structure

- \`src/app/core/\` - Singleton services and core functionality
- \`src/app/shared/\` - Reusable components, directives, pipes
- \`src/app/layout/\` - Layout components (header, footer)
- \`src/app/features/\` - Feature modules (lazy-loaded)
- \`src/assets/\` - Static assets including reference images

## Komodo Components Usage

Import Komodo modules in your feature modules:

\`\`\`typescript
import { KomodoButtonModule, KomodoCardModule } from '@business-app-systems/komodo-ui';

@NgModule({
  imports: [
    KomodoButtonModule,
    KomodoCardModule
  ]
})
\`\`\`

Use in templates:

\`\`\`html
<komodo-button>Click Me</komodo-button>
<komodo-card>
  <komodo-card-header>Title</komodo-card-header>
  <komodo-card-content>Content here</komodo-card-content>
</komodo-card>
\`\`\`

## Generated by CodeGen Automator

This project was automatically generated with:
- Module-based architecture (NOT standalone)
- Komodo UI component library
- SCSS styling${hasReferenceImages ? '\n- UI matching reference images' : ''}
`;
    
    fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

async function createConfigFiles(projectPath, config) {
    const gitignore = `# Dependencies
node_modules/

# Build outputs
dist/
.angular/

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
coverage/

# Environment
.env
.env.local
`;
    
    const editorconfig = `root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
max_line_length = off
trim_trailing_whitespace = false
`;
    
    const npmrc = `legacy-peer-deps=true
`;
    
    fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);
    fs.writeFileSync(path.join(projectPath, '.editorconfig'), editorconfig);
    fs.writeFileSync(path.join(projectPath, '.npmrc'), npmrc);
    
    // Generate entity-specific components and services
    const entities = config.entities || [];
    if (entities.length > 0) {
        console.log('\n📦 Generating entity-specific features...');
        for (const entity of entities) {
            console.log(`   ✓ Generating ${entity} feature...`);
            await generateEntityFeature(projectPath, entity, config.description);
        }
    }
}

/**
 * Generate entity-specific component with AI or template
 */
async function generateEntityComponent(entityName, description = '', useAI = true) {
    const entityClass = capitalize(entityName);
    const entityPlural = pluralize(entityName);
    
    // Try AI generation first
    if (useAI && description) {
        const aiPrompt = `Generate an Angular component for managing '${entityName}' entities in a ${description}.

Requirements:
1. Component class name: ${entityClass}ListComponent
2. Use Angular 17+ patterns with standalone: false (module-based)
3. Include TypeScript interface for ${entityClass} with relevant properties based on context
4. Include CRUD operations: list, create, update, delete
5. Use reactive forms for create/edit
6. Include error handling and loading states
7. Use modern Angular patterns (signals, inject(), etc.)
8. Include proper typing and documentation
9. Return ONLY the TypeScript component code, no explanations

Generate the component.ts file content:`;

        const aiCode = await generateCodeWithAI(aiPrompt, null, 3000);
        if (aiCode) {
            // Clean up markdown code blocks if present
            let cleanCode = aiCode.replace(/```typescript\n?/g, '').replace(/```\n?/g, '');
            return cleanCode;
        }
    }
    
    // Fallback to template
    return `import { Component, OnInit } from '@angular/core';
import { ${entityClass}Service } from '../../services/${entityName}.service';
import { ${entityClass} } from '../../../core/interfaces/${entityName}.interface';

@Component({
  selector: 'app-${entityName}-list',
  templateUrl: './${entityName}-list.component.html',
  styleUrls: ['./${entityName}-list.component.scss'],
  standalone: false
})
export class ${entityClass}ListComponent implements OnInit {
  ${entityPlural}: ${entityClass}[] = [];
  loading = false;
  error: string | null = null;

  constructor(private ${entityName}Service: ${entityClass}Service) {}

  ngOnInit(): void {
    this.load${entityClass}s();
  }

  load${entityClass}s(): void {
    this.loading = true;
    this.${entityName}Service.getAll().subscribe({
      next: (data) => {
        this.${entityPlural} = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ${entityPlural}';
        this.loading = false;
      }
    });
  }

  delete${entityClass}(id: number): void {
    if (confirm('Are you sure?')) {
      this.${entityName}Service.delete(id).subscribe({
        next: () => this.load${entityClass}s(),
        error: (err) => this.error = 'Failed to delete ${entityName}'
      });
    }
  }
}
`;
}

/**
 * Generate entity-specific service with AI or template
 */
async function generateEntityService(entityName, description = '', useAI = true) {
    const entityClass = capitalize(entityName);
    const entityPlural = pluralize(entityName);
    
    // Try AI generation first
    if (useAI && description) {
        const aiPrompt = `Generate an Angular service for managing '${entityName}' entities in a ${description}.

Requirements:
1. Service class name: ${entityClass}Service
2. Use HttpClient for API calls
3. Include methods: getAll(), getById(id), create(data), update(id, data), delete(id)
4. Return Observables with proper typing
5. Include error handling
6. Use environment.apiUrl for base URL
7. Include proper TypeScript interfaces
8. Return ONLY the TypeScript service code, no explanations

Generate the service.ts file content:`;

        const aiCode = await generateCodeWithAI(aiPrompt, null, 2000);
        if (aiCode) {
            // Clean up markdown code blocks if present
            let cleanCode = aiCode.replace(/```typescript\n?/g, '').replace(/```\n?/g, '');
            return cleanCode;
        }
    }
    
    // Fallback to template
    return `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ${entityClass} } from '../../core/interfaces/${entityName}.interface';

@Injectable({
  providedIn: 'root'
})
export class ${entityClass}Service {
  private apiUrl = \`\${environment.apiUrl}/${entityPlural}\`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<${entityClass}[]> {
    return this.http.get<${entityClass}[]>(this.apiUrl);
  }

  getById(id: number): Observable<${entityClass}> {
    return this.http.get<${entityClass}>(\`\${this.apiUrl}/\${id}\`);
  }

  create(data: Partial<${entityClass}>): Observable<${entityClass}> {
    return this.http.post<${entityClass}>(this.apiUrl, data);
  }

  update(id: number, data: Partial<${entityClass}>): Observable<${entityClass}> {
    return this.http.put<${entityClass}>(\`\${this.apiUrl}/\${id}\`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`);
  }
}
`;
}

/**
 * Generate complete entity feature (module, component, service, interface)
 */
async function generateEntityFeature(projectPath, entityName, description) {
    const entityClass = capitalize(entityName);
    const entityPlural = pluralize(entityName);
    const featurePath = path.join(projectPath, 'src/app/features', entityPlural);
    
    // Generate component
    const componentCode = await generateEntityComponent(entityName, description);
    fs.writeFileSync(
        path.join(featurePath, 'components', `${entityName}-list.component.ts`),
        componentCode
    );
    
    // Generate component HTML template
    const componentHtml = `<div class="${entityName}-list">
  <h2>${entityClass} Management</h2>
  
  <div *ngIf="loading" class="loading">Loading...</div>
  <div *ngIf="error" class="error">{{ error }}</div>
  
  <div class="${entityPlural}-grid">
    <div *ngFor="let ${entityName} of ${entityPlural}" class="${entityName}-card">
      <h3>{{ ${entityName}.name || ${entityName}.title }}</h3>
      <button (click)="delete${entityClass}(${entityName}.id)">Delete</button>
    </div>
  </div>
</div>
`;
    fs.writeFileSync(
        path.join(featurePath, 'components', `${entityName}-list.component.html`),
        componentHtml
    );
    
    // Generate component SCSS
    const componentScss = `.${entityName}-list {
  padding: 20px;
  
  .${entityPlural}-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .${entityName}-card {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
  }
}
`;
    fs.writeFileSync(
        path.join(featurePath, 'components', `${entityName}-list.component.scss`),
        componentScss
    );
    
    // Generate service
    const serviceCode = await generateEntityService(entityName, description);
    fs.writeFileSync(
        path.join(featurePath, 'services', `${entityName}.service.ts`),
        serviceCode
    );
    
    // Generate interface
    const interfaceCode = `export interface ${entityClass} {
  id: number;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
`;
    fs.writeFileSync(
        path.join(projectPath, 'src/app/core/interfaces', `${entityName}.interface.ts`),
        interfaceCode
    );
    
    // Generate feature module
    const moduleCode = `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ${entityClass}ListComponent } from './components/${entityName}-list.component';

const routes: Routes = [
  { path: '', component: ${entityClass}ListComponent }
];

@NgModule({
  declarations: [${entityClass}ListComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ${entityClass}Module { }
`;
    fs.writeFileSync(
        path.join(featurePath, `${entityName}.module.ts`),
        moduleCode
    );
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function createDockerFiles(projectPath, projectName) {
    const dockerfile = `# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist/${projectName} /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`;
    
    const dockerCompose = `version: '3.8'

services:
  web:
    build: .
    ports:
      - "4200:80"
    volumes:
      - ./dist/${projectName}:/usr/share/nginx/html
`;
    
    fs.writeFileSync(path.join(projectPath, 'Dockerfile'), dockerfile);
    fs.writeFileSync(path.join(projectPath, 'docker-compose.yml'), dockerCompose);
}

async function main() {
    if (process.argv.length < 4) {
        console.error('Usage: generate-angular.js <project_name> <metadata_file>');
        process.exit(1);
    }
    
    const projectName = process.argv[2];
    const metadataFile = process.argv[3];
    
    // Read metadata
    const metadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
    const issueBody = metadata.issue_body;
    const config = parseIssueBody(issueBody);
    
    // Determine output directory
    const outputDir = path.resolve('generated-projects');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Check for reference images in the current directory
    const projectDir = process.cwd();
    const referenceImages = findReferenceImages(projectDir);
    
    if (referenceImages.length > 0) {
        console.log(`\n🎨 Found ${referenceImages.length} reference image(s) for UI generation`);
    }
    
    await generateAngularProject(projectName, config, outputDir, referenceImages);
}

if (require.main === module) {
    main().catch(error => {
        console.error('Error generating Angular project:', error);
        process.exit(1);
    });
}
