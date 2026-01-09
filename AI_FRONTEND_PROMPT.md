# AI Frontend Development Prompt Template

Copy and customize this prompt when starting a new Angular frontend project with UI libraries.

---

## Frontend Project Setup Instructions

### CRITICAL: Pre-Development Checklist

Before writing any code, ensure:

1. **Dependency Verification**:

   - Check UI library documentation for ALL peer dependencies
   - Explicitly add peer dependencies to package.json (don't rely on auto-installation)
   - Example: ng-zorro-antd requires `@ctrl/tinycolor` - add it explicitly
   - Run `npm list <library-name>` after installation to verify dependency tree

2. **RxJS Modern Patterns**:

   - NEVER use deprecated `.toPromise()` method
   - ALWAYS use `firstValueFrom()` or `lastValueFrom()` from 'rxjs'
   - Import pattern: `import { firstValueFrom } from 'rxjs';`
   - Usage: `const result = await firstValueFrom(observable$);`

3. **Component vs Directive Verification**:

   - Before using any UI library element, verify if it's a component or directive
   - Components: `<nz-button>`, `<nz-card>` (standalone elements)
   - Directives: `<img nz-image>`, `<ul nz-menu>` (enhance existing elements)
   - Check library documentation for correct usage pattern

4. **Standalone Component Module Imports**:

   - Import UI library modules in component's `imports` array, not just AppModule
   - Verify library supports standalone components (some work better with NgModule)
   - For global providers, use `provide*` functions or minimal NgModule

5. **Build Configuration**:
   - Set realistic bundle size budgets (UI libraries are large):
     ```json
     "budgets": [{
       "type": "initial",
       "maximumWarning": "2mb",
       "maximumError": "5mb"
     }]
     ```
   - Enable production optimizations
   - Disable source maps in production

### Development Rules

**When implementing components:**

1. **Import Statements**:

   - Use exact import paths: `ng-zorro-antd/button` not `ng-zorro-antd`
   - Import modules, not individual components
   - For standalone: Import in component's `imports` array

2. **Template Usage**:

   - Verify component/directive syntax before using
   - Check library examples for correct attribute names
   - Test rendering early to catch syntax errors

3. **TypeScript**:

   - Enable strict mode
   - Use `moduleResolution: "node"`
   - Target ES2022 or higher
   - Enable `experimentalDecorators: true`

4. **Error Prevention**:
   - Never use deprecated APIs (check library changelog)
   - Verify all imports resolve correctly
   - Check for TypeScript errors before building
   - Test build early: `npm run build`

### Before Marking Complete

**MANDATORY Verification Steps:**

1. ✅ Run `npm install` and verify no peer dependency warnings
2. ✅ Run `npm run build` - must complete without errors
3. ✅ Verify bundle sizes are within configured budgets
4. ✅ Check all UI components render correctly
5. ✅ Verify no deprecated APIs are used
6. ✅ Confirm all imports are correct and resolve
7. ✅ Test that animations work (if using UI library animations)

### Common UI Library Patterns

**ng-zorro-antd:**

- Peer deps: `@ctrl/tinycolor`
- Components: Most elements (`<nz-button>`, `<nz-card>`)
- Directives: `nz-image` (on `<img>`), `nz-menu` (on `<ul>`)
- Icons: Requires `NzIconModule`

**Angular Material:**

- Peer deps: `@angular/cdk`
- All elements are components
- Requires `BrowserAnimationsModule` or `provideAnimations()`

**PrimeNG:**

- All elements are components
- Requires CSS theme import

### Example: Correct Standalone Component Pattern

```typescript
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { firstValueFrom } from "rxjs"; // Modern RxJS
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule, // Import module in component
    NzCardModule,
  ],
  templateUrl: "./example.component.html",
})
export class ExampleComponent {
  async loadData() {
    // Use firstValueFrom, never toPromise()
    const data = await firstValueFrom(this.service.getData$());
  }
}
```

**Template:**

```html
<!-- Component usage -->
<nz-button nzType="primary">Click</nz-button>

<!-- Directive usage (if applicable) -->
<img nz-image [nzSrc]="url" [nzFallback]="fallback" />
```

---

## Usage Instructions

1. Copy this prompt template
2. Add your specific project requirements (UI library, Angular version, etc.)
3. Include this prompt at the start of your AI conversation
4. Reference it when encountering build errors
5. Update it based on lessons learned from each project

---

**Remember**: Most frontend build errors are caused by missing dependencies, incorrect imports, or deprecated APIs. Always verify these three areas first.
