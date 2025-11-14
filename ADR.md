# Architecture Decision Records

## Decision 1: Using JSON Files for Data Storage

**Date**: Project Start

**Context**: Needed a simple way to store contacts and tasks without setting up a database.

**Decision**: Use JSON files stored in `lib/db/` directory. Data is loaded into memory on server start and persisted to files after each write operation.

**Consequences**:
- Simple to implement and understand
- No database setup required
- Works well for small to medium datasets
- Not suitable for high-traffic applications
- Data is lost if server crashes before write completes

## Decision 2: Three-Layer Architecture

**Date**: Project Start

**Context**: Need to organize code in a maintainable way.

**Decision**: Separate code into three layers:
1. API Routes (Next.js routes) - Handle HTTP requests
2. Service Layer - Business logic and validation
3. Database Layer - Data persistence

**Consequences**:
- Clear separation of concerns
- Easy to test each layer independently
- Can swap database layer without changing services
- More files to manage

## Decision 3: Client-Side Validation + Server-Side Validation

**Date**: Project Start

**Context**: Need to provide good user experience and ensure data integrity.

**Decision**: Validate data in both frontend (for immediate feedback) and backend (for security).

**Consequences**:
- Users get instant feedback
- Server validates all data regardless of frontend
- Some code duplication between frontend and backend validators
- More robust application

## Decision 4: Pure CSS Instead of CSS Frameworks

**Date**: Project Start

**Context**: Need to style the application.

**Decision**: Use pure CSS in `app/globals.css` instead of Tailwind or CSS Modules.

**Consequences**:
- Full control over styling
- No external dependencies for CSS
- All styles in one file
- Larger CSS file to manage

## Decision 5: In-Memory Database with File Persistence

**Date**: Project Start

**Context**: Need fast reads but also need data to persist.

**Decision**: Load JSON files into memory on startup, keep in memory for fast access, write to file after each modification.

**Consequences**:
- Very fast read operations
- Data persists across server restarts
- Risk of data loss if server crashes
- Not suitable for multiple server instances

