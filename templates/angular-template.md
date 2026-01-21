# Angular Enterprise Template

This template follows Angular foundation project standards based on MCP server configurations.

## Project Structure (Module-Based Architecture)

```
{project_name}/
├── src/
│   ├── app/
│   │   ├── api/                    # API service layer
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── core/                   # Core module (singleton services)
│   │   │   ├── helpers/           # Helper utilities
│   │   │   ├── interfaces/        # Core interfaces
│   │   │   ├── services/          # Core services
│   │   │   ├── stores/            # State management
│   │   │   └── core.module.ts
│   │   ├── shared/                # Shared module (reusable components)
│   │   │   ├── components/        # Shared components
│   │   │   ├── directives/        # Custom directives
│   │   │   ├── pipes/             # Custom pipes
│   │   │   ├── services/          # Shared services
│   │   │   ├── interceptors/      # HTTP interceptors
│   │   │   ├── validators/        # Form validators
│   │   │   ├── utilities/         # Utility functions
│   │   │   ├── constants/         # Constants
│   │   │   └── shared.module.ts
│   │   ├── layout/                # Layout components module
│   │   │   ├── header/
│   │   │   ├── footer/
│   │   │   ├── sidebar/
│   │   │   └── layout.module.ts
│   │   ├── features/              # Feature modules
│   │   │   └── {feature}/
│   │   │       ├── components/
│   │   │       ├── services/
│   │   │       ├── models/
│   │   │       └── {feature}.module.ts
│   │   ├── guards/                # Route guards
│   │   ├── interceptors/          # HTTP interceptors
│   │   ├── models/                # Data models/interfaces
│   │   ├── services/              # Feature services
│   │   ├── app-routing.module.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.component.spec.ts
│   │   └── app.module.ts
│   ├── assets/                    # Static assets
│   │   ├── fonts/
│   │   ├── images/
│   │   └── i18n/
│   ├── environments/              # Environment configurations
│   │   ├── environment.ts
│   │   ├── environment.qa.ts
│   │   └── environment.prod.ts
│   ├── styles/                    # Global styles
│   │   ├── _variables.scss
│   │   ├── _mixins.scss
│   │   └── _typography.scss
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── public/                        # Public assets
├── nginx/                         # Nginx configuration
│   └── nginx.conf
├── angular.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── package.json
├── karma.conf.js
├── .editorconfig
├── .npmrc
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Critical Architecture Requirements

### MODULE-BASED (NOT Standalone Components)

**IMPORTANT:** This template uses traditional Angular modules, NOT standalone components.

All components, directives, and pipes must have:
```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  standalone: false  // CRITICAL: Required for module-based architecture
})
```

### Angular Configuration (angular.json)

```json
{
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
  }
}
```

## Core Modules

### CoreModule (src/app/core/core.module.ts)

Singleton services and app-wide utilities:
```typescript
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    // Add core singleton services here
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in AppModule only.');
    }
  }
}
```

### SharedModule (src/app/shared/shared.module.ts)

Reusable components, directives, pipes:
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    // Add shared components, directives, pipes here
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
    // Export shared components, directives, pipes
  ]
})
export class SharedModule { }
```

### LayoutModule (src/app/layout/layout.module.ts)

Layout components (header, footer, sidebar):
```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    // Add layout components here
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    // Export layout components
  ]
})
export class LayoutModule { }
```

## AppModule Configuration

```typescript
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
```

## Main Entry Point (src/main.ts)

```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true
  })
  .catch((err: Error) => console.error(err));
```

## HTTP Interceptors

### Error Handling Interceptor

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorHandlingInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          errorMsg = `Error: ${error.error.message}`;
        } else {
          errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.error(errorMsg);
        return throwError(() => error);
      })
    );
  }
}
```

## Environment Configuration

### environment.ts
```typescript
export const environment = {
  production: false,
  apiEndpointUrl: 'http://localhost:8000/api',
  apiEndpointUrlLocal: '.'
};
```

### environment.prod.ts
```typescript
export const environment = {
  production: true,
  apiEndpointUrl: '/api',
  apiEndpointUrlLocal: '.'
};
```

## Routing Configuration

```typescript
import { NgModule } from '@angular/core';
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
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
```

## TypeScript Configuration

### tsconfig.json
```json
{
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
}
```

## Styling Standards

### SCSS Architecture
```
styles/
├── _variables.scss    # Color palette, spacing, breakpoints
├── _mixins.scss       # Reusable SCSS mixins
├── _typography.scss   # Font styles and sizes
└── _utilities.scss    # Utility classes
```

### Global Styles (src/styles.scss)
```scss
/* Import variables and utilities */
@import 'styles/variables';
@import 'styles/mixins';
@import 'styles/typography';

/* Global reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: #333;
  background-color: #f5f5f5;
}
```

## Component Structure

### Feature Component Example
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feature',
  templateUrl: './feature.component.html',
  styleUrls: ['./feature.component.scss'],
  standalone: false
})
export class FeatureComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor() { }
  
  ngOnInit(): void {
    // Initialization logic
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

## Testing Standards

### Component Test Example
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureComponent } from './feature.component';

describe('FeatureComponent', () => {
  let component: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Docker Configuration

### Dockerfile (Multi-stage Build)
```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/{project_name}/browser /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Package.json Scripts

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test",
    "build:qa": "ng build --configuration qa",
    "build:prod": "ng build --configuration production",
    "build:local": "ng build --configuration development",
    "lint": "ng lint",
    "e2e": "ng e2e"
  }
}
```

## Code Standards

### Style Guide
- Follow Angular style guide
- Use TypeScript strict mode
- Implement proper typing
- Use async pipe for observables
- Unsubscribe from observables
- Use OnPush change detection where possible

### File Naming Conventions
- Components: `feature-name.component.ts`
- Services: `feature-name.service.ts`
- Modules: `feature-name.module.ts`
- Models: `feature-name.model.ts`
- Interfaces: `feature-name.interface.ts`

## UI Framework Options

### Supported UI Libraries
- PrimeNG + PrimeIcons + PrimeFlex
- Angular Material + CDK
- Bootstrap + ng-bootstrap
- TailwindCSS

### Installation (Example: PrimeNG)
```bash
npm install primeng primeicons primeflex --legacy-peer-deps
```

## Reference Standards

This template follows:
- Thermofisher enterprise standards
- sso-continuum-sdlc/frontend reference project
- Angular best practices
- Module-based architecture (NOT standalone)
- SCSS styling with BEM methodology
- RESTful API integration patterns
- Docker containerization
- Nginx deployment
