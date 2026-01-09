# Frontend Development Prompt Template

Use this prompt when starting a new Angular frontend project to avoid common build and integration issues.

---

## Project Setup Instructions

### 1. Dependency Management

**CRITICAL**: When using UI component libraries (ng-zorro-antd, Angular Material, PrimeNG, etc.):

- **Always check peer dependencies**: Before finalizing package.json, verify all peer dependencies required by UI libraries are explicitly listed
- **Install peer dependencies explicitly**: Don't rely on automatic installation. For example:
  - ng-zorro-antd requires `@ctrl/tinycolor` - add it explicitly
  - Check library documentation for all peer dependencies
- **Use exact or caret versions for UI libraries**: Prefer `^` for UI libraries to get patch updates while maintaining compatibility
- **Verify dependency tree**: Run `npm list <library-name>` after installation to ensure all dependencies are resolved

### 2. Angular Standalone Components

**When using Angular 17+ standalone components with UI libraries:**

- **Module imports in standalone components**: Import UI library modules directly in the component's `imports` array
- **Avoid mixing NgModule and standalone**: If using standalone components, don't import NgModules in AppModule unless necessary for global providers
- **Provider configuration**: For global providers (like i18n), use `provide*` functions in `app.config.ts` or keep minimal NgModule only for providers
- **Component vs Directive**:
  - Verify whether UI library elements are components or directives
  - Components: `<nz-button>`, `<nz-card>`
  - Directives: `<img nz-image>`, `<div nz-menu>`
  - Check library documentation for correct usage

### 3. RxJS Best Practices

**Modern RxJS patterns (v7+):**

- **NEVER use `.toPromise()`**: It's deprecated. Always use `firstValueFrom()` or `lastValueFrom()` from 'rxjs'
- **Import pattern**: `import { firstValueFrom } from 'rxjs';`
- **Usage**: `const result = await firstValueFrom(observable$);`
- **Error handling**: Wrap in try-catch as observables converted to promises will reject on error

### 4. Build Configuration

**Angular build settings:**

- **Bundle size budgets**: UI libraries (especially Ant Design, Material) create larger bundles. Set realistic budgets:
  ```json
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2mb",
      "maximumError": "5mb"
    }
  ]
  ```
- **Production optimization**: Ensure `optimization: true` in production builds
- **Source maps**: Disable in production for smaller bundles
- **Tree shaking**: Verify unused code is eliminated (check bundle analyzer)

### 5. TypeScript Configuration

**TypeScript settings for Angular:**

- **Strict mode**: Enable strict mode for better type safety
- **Module resolution**: Use `"moduleResolution": "node"` for proper node_modules resolution
- **Target**: Use ES2022 or higher for modern JavaScript features
- **Experimental decorators**: Required for Angular: `"experimentalDecorators": true`

### 6. UI Library Integration Checklist

**Before declaring completion, verify:**

- [ ] All peer dependencies are installed
- [ ] Components/directives are used correctly (check library docs)
- [ ] Modules are imported in standalone component `imports` array
- [ ] No deprecated APIs are used (check library changelog)
- [ ] Bundle size is within acceptable limits
- [ ] Build completes without errors or warnings
- [ ] All UI components render correctly
- [ ] Animations are properly configured (BrowserAnimationsModule or provideAnimations)

### 7. Common Pitfalls to Avoid

**Specific issues to watch for:**

1. **Missing peer dependencies**: UI libraries often have hidden dependencies
2. **Component/Directive confusion**: Some UI elements are directives, not components
3. **Standalone component module imports**: Must import modules in component, not just AppModule
4. **Deprecated RxJS methods**: Never use `.toPromise()`
5. **Bundle size limits**: Default Angular budgets are too small for UI libraries
6. **Import paths**: Use exact paths from library (e.g., `ng-zorro-antd/button` not `ng-zorro-antd`)
7. **Provider setup**: Some libraries need global providers (i18n, icons, etc.)

### 8. Testing Build Before Completion

**Always run these commands before marking as complete:**

```bash
# Install dependencies
npm install

# Run production build
npm run build

# Verify no errors
# Check bundle sizes are acceptable
# Verify all components render
```

### 9. Documentation References

**Keep these handy:**

- Angular Standalone Components: https://angular.io/guide/standalone-components
- RxJS Migration Guide: https://rxjs.dev/deprecations/to-promise
- UI Library Documentation (check specific library)
- Angular Build Configuration: https://angular.io/guide/build

### 10. Error Resolution Strategy

**When build errors occur:**

1. **Check peer dependencies first**: Most UI library errors are missing dependencies
2. **Verify import statements**: Ensure correct import paths
3. **Check component vs directive**: Verify correct usage pattern
4. **Review library version compatibility**: Ensure Angular version matches library requirements
5. **Check TypeScript errors**: May reveal missing types or incorrect usage
6. **Review bundle size**: May need to adjust budgets or optimize imports

---

## Example Integration Pattern

**For ng-zorro-antd with standalone components:**

```typescript
// Component file
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzCardModule } from "ng-zorro-antd/card";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "app-example",
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule, // Import module, not component
    NzCardModule,
  ],
  templateUrl: "./example.component.html",
})
export class ExampleComponent {
  async loadData() {
    // Use firstValueFrom, not toPromise()
    const data = await firstValueFrom(this.dataService.getData$());
  }
}
```

**Template usage:**

```html
<!-- Component usage -->
<nz-button nzType="primary">Click</nz-button>

<!-- Directive usage -->
<img nz-image [nzSrc]="imageUrl" [nzFallback]="fallbackUrl" />
```

---

## Quick Reference: Common UI Libraries

### ng-zorro-antd

- Peer deps: `@ctrl/tinycolor`
- Components: Most elements are components (`<nz-button>`, `<nz-card>`)
- Directives: `nz-image` is a directive on `<img>` tag
- Icons: Requires `NzIconModule` and icon setup

### Angular Material

- Peer deps: `@angular/cdk`
- Components: All elements are components
- Animations: Requires `BrowserAnimationsModule` or `provideAnimations()`

### PrimeNG

- Components: All elements are components
- Theme: Requires CSS import

---

**Remember**: Always verify the specific library's documentation for the exact version you're using, as patterns may differ between versions.
