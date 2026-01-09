# Backend Development Prompt Template

Use this prompt when starting a new Node.js/TypeScript backend project to avoid common build and integration issues.

---

## Project Setup Instructions

### 1. Dependency Management

**CRITICAL**: When using backend libraries and frameworks:

- **Always check peer dependencies**: Before finalizing package.json, verify all peer dependencies required by libraries are explicitly listed
- **Install peer dependencies explicitly**: Don't rely on automatic installation. For example:
  - Express requires `@types/express` for TypeScript - add it explicitly
  - Some libraries require specific Node.js versions - check documentation
- **Use exact or caret versions for core dependencies**: Prefer `^` for libraries to get patch updates while maintaining compatibility
- **Separate dependencies and devDependencies**:
  - `dependencies`: Runtime dependencies (express, discord.js, etc.)
  - `devDependencies`: Build-time dependencies (@types/\*, typescript, ts-node-dev, etc.)
- **Verify dependency tree**: Run `npm list <library-name>` after installation to ensure all dependencies are resolved

### 2. TypeScript Configuration

**TypeScript settings for Node.js backend:**

- **Strict mode**: Enable strict mode for better type safety (`"strict": true`)
- **Module resolution**: Use `"moduleResolution": "node"` for proper node_modules resolution
- **Target**: Use ES2020 or higher for modern JavaScript features
- **Module system**: Use `"module": "commonjs"` for Node.js compatibility
- **Out directory**: Set `"outDir": "./dist"` to separate compiled code from source
- **Root directory**: Set `"rootDir": "./src"` to organize source files
- **ES Module interop**: Enable `"esModuleInterop": true` for better compatibility with CommonJS modules
- **Skip lib check**: Use `"skipLibCheck": true` to speed up compilation (skip type checking of declaration files)

### 3. Async/Await Best Practices

**Modern async patterns:**

- **NEVER use `.then()` chains**: Prefer async/await for better readability and error handling
- **Always handle errors**: Wrap async operations in try-catch blocks
- **Promise handling**: Use `Promise.all()` for parallel operations, `Promise.allSettled()` when you need all results regardless of failures
- **Error propagation**: Let errors bubble up or handle them appropriately at the right level
- **Avoid callback hell**: Use async/await instead of nested callbacks

### 4. Express.js Best Practices

**Express.js patterns:**

- **Middleware order matters**: Place middleware in correct order (CORS before routes, body parser before route handlers)
- **Error handling middleware**: Always include error handling middleware at the end of middleware chain
- **Route organization**: Organize routes in separate files/modules for maintainability
- **Environment variables**: Use `dotenv` for configuration, never hardcode secrets
- **Request validation**: Validate and sanitize input data before processing
- **Response consistency**: Use consistent response formats across all endpoints
- **Async route handlers**: Always use async/await in route handlers, handle errors properly

### 5. Build Configuration

**TypeScript build settings:**

- **Compilation**: Use `tsc` for production builds
- **Development**: Use `ts-node-dev` or `tsx` for development with hot reload
- **Source maps**: Enable source maps in development, disable in production
- **Output directory**: Keep compiled code separate from source (`dist/` folder)
- **Type checking**: Run type checking separately from compilation if needed (`tsc --noEmit`)

### 6. Environment Configuration

**Environment variables:**

- **Use .env files**: Store environment-specific configuration in `.env` files
- **Never commit .env**: Add `.env` to `.gitignore`
- **Provide .env.example**: Create `.env.example` with placeholder values for documentation
- **Validate required variables**: Check for required environment variables at startup
- **Type safety**: Consider using libraries like `zod` or `joi` for environment variable validation
- **Default values**: Provide sensible defaults where appropriate

### 7. API Design Best Practices

**RESTful API patterns:**

- **Consistent naming**: Use consistent naming conventions (kebab-case for URLs, camelCase for JSON)
- **HTTP methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **Status codes**: Return appropriate HTTP status codes (200, 201, 400, 401, 404, 500, etc.)
- **Error responses**: Use consistent error response format
- **Pagination**: Implement pagination for list endpoints
- **Versioning**: Consider API versioning for future compatibility
- **Documentation**: Document API endpoints (consider OpenAPI/Swagger)

### 8. Database Integration Checklist

**When integrating databases:**

- [ ] Database client library is installed (e.g., `pg`, `mongoose`, `prisma`)
- [ ] Connection pooling is configured properly
- [ ] Environment variables for connection strings are set
- [ ] Migrations/seeding scripts are set up (if applicable)
- [ ] Error handling for database operations is implemented
- [ ] Transactions are used when needed
- [ ] Connection cleanup on shutdown is implemented

### 9. Third-Party API Integration

**When integrating external APIs:**

- [ ] API client library is installed and configured
- [ ] API keys/tokens are stored in environment variables
- [ ] Rate limiting is handled appropriately
- [ ] Error handling for API failures is implemented
- [ ] Retry logic is implemented for transient failures
- [ ] Timeout configuration is set
- [ ] Type definitions for API responses are created (if available)

### 10. Common Pitfalls to Avoid

**Specific issues to watch for:**

1. **Missing type definitions**: Always install `@types/*` packages for JavaScript libraries
2. **Type assertion misuse**: Avoid `as any` or unsafe type assertions - use proper types or `unknown` first
3. **Unhandled promise rejections**: Always catch errors in async functions
4. **Memory leaks**: Clean up event listeners, database connections, and timers
5. **Blocking the event loop**: Avoid synchronous operations in request handlers
6. **Missing CORS configuration**: Configure CORS properly for frontend integration
7. **Insecure dependencies**: Regularly update dependencies to patch security vulnerabilities
8. **Hardcoded secrets**: Never commit API keys, tokens, or passwords to version control
9. **Missing error handling**: Always handle errors at appropriate levels
10. **Type mismatches**: Be careful with Discord.js and other libraries that may have complex type definitions

### 11. Testing Build Before Completion

**Always run these commands before marking as complete:**

```bash
# Install dependencies
npm install

# Run TypeScript compilation
npm run build

# Verify no compilation errors
# Check that dist/ folder is created correctly
# Verify all imports resolve correctly
# Test that the server starts without errors
```

### 12. Development vs Production

**Environment differences:**

- **Development**:
  - Use `ts-node-dev` for hot reload
  - Enable detailed error messages
  - Use development database/API endpoints
  - Enable verbose logging
- **Production**:
  - Compile TypeScript to JavaScript first
  - Run compiled JavaScript with `node`
  - Use production database/API endpoints
  - Minimize logging, use structured logging
  - Enable error tracking (Sentry, etc.)
  - Set up process managers (PM2, systemd, etc.)

### 13. Error Handling Strategy

**When errors occur:**

1. **Check TypeScript compilation errors first**: Most issues are type-related
2. **Verify import statements**: Ensure correct import paths and default vs named imports
3. **Check environment variables**: Ensure all required variables are set
4. **Review library documentation**: Verify correct usage patterns
5. **Check Node.js version compatibility**: Ensure Node.js version matches library requirements
6. **Review async/await usage**: Ensure all promises are properly handled
7. **Check middleware order**: Verify Express middleware is in correct order
8. **Review type definitions**: May reveal missing types or incorrect usage

---

## Example Integration Pattern

**For Express.js with TypeScript:**

```typescript
// server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRoutes } from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (order matters!)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api", createRoutes());

// Error handling middleware (must be last)
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});
```

**Route handler with async/await:**

```typescript
// routes/example.routes.ts
import { Router, Request, Response } from "express";
import { ExampleService } from "../services/example.service";

const router = Router();
const exampleService = new ExampleService();

router.get("/example/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await exampleService.getById(id);

    if (!result) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Error fetching example:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as createExampleRoutes };
```

**Service with proper error handling:**

```typescript
// services/example.service.ts
export class ExampleService {
  async getById(id: string): Promise<Example | null> {
    try {
      // Async operation
      const result = await someAsyncOperation(id);
      return result;
    } catch (error) {
      // Log error for debugging
      console.error(`Error fetching example ${id}:`, error);
      // Re-throw or return null based on requirements
      throw error;
    }
  }
}
```

---

## Quick Reference: Common Backend Libraries

### Express.js

- **Type definitions**: `@types/express`
- **Middleware**: Import and use `app.use()`
- **Routes**: Use `Router()` for route organization
- **Body parsing**: Use `express.json()` for JSON payloads

### Discord.js

- **Type definitions**: Included in package
- **Collections**: Use type assertions when TypeScript inference fails: `as unknown as Collection<string, Type>`
- **Async operations**: All Discord operations are async, use await
- **Error handling**: Handle Discord API errors appropriately

### Database Libraries

**PostgreSQL (pg)**:

- Type definitions: `@types/pg`
- Use connection pooling
- Always use parameterized queries

**MongoDB (mongoose)**:

- Type definitions: Included
- Define schemas with TypeScript interfaces
- Use async/await for all operations

**Prisma**:

- Type definitions: Generated automatically
- Run `prisma generate` after schema changes
- Use Prisma Client for type-safe queries

### Environment Variables

**dotenv**:

- Load with `dotenv.config()` at startup
- Access via `process.env.VARIABLE_NAME`
- Type as `string | undefined` or validate with zod/joi

### CORS

**cors**:

- Type definitions: `@types/cors`
- Configure origin, credentials, methods
- Place before route handlers

---

## TypeScript Type Assertion Patterns

**When dealing with complex library types:**

```typescript
// Double assertion through unknown (when TypeScript inference fails)
const collection = (await someMethod()) as unknown as Collection<string, Type>;

// Type guard pattern (preferred when possible)
function isCollection<T>(value: unknown): value is Collection<string, T> {
  return value instanceof Collection;
}

// Proper typing with generics
async function fetchMessages<T extends Message>(): Promise<
  Collection<string, T>
> {
  // Implementation
}
```

---

## Graceful Shutdown Pattern

**Always implement graceful shutdown:**

```typescript
// Cleanup function
async function cleanup() {
  // Close database connections
  await db.close();

  // Disconnect external services
  await discordService.disconnect();

  // Close server
  server.close(() => {
    console.log("Server closed");
  });
}

// Handle shutdown signals
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);

// Handle uncaught errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  cleanup();
});
```

---

**Remember**: Always verify the specific library's documentation for the exact version you're using, as patterns may differ between versions. Keep dependencies updated for security patches.
