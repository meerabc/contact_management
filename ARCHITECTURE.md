# Architecture Documentation

## System Design Overview

This document describes the architectural decisions, patterns, and design principles used in the Contact Manager application.

## Architecture Pattern: Three-Tier Layered Architecture

The application follows a clean, layered architecture separating concerns into three distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components (UI, pages, forms, lists)                  │
│  - Next.js Pages (page.tsx, layout.tsx)                      │
│  - Components (ContactForm, TaskForm, ContactList, etc)      │
│  - Hooks (useForm, useAsync, useToast)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Requests/Responses
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Routes)                        │
│  Next.js API Routes (app/api/...)                           │
│  - Request validation                                        │
│  - Service layer invocation                                  │
│  - Response formatting                                       │
│  - Error handling                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │ Function Calls
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 SERVICE LAYER (Business Logic)               │
│  Services (contactService, taskService)                      │
│  - Data validation using validators                          │
│  - Business rule enforcement                                 │
│  - Database layer orchestration                              │
│  - Error handling and logging                                │
└──────────────────────────┬──────────────────────────────────┘
                           │ Function Calls
                           ↓
┌─────────────────────────────────────────────────────────────┐
│               DATABASE LAYER (Persistence)                   │
│  JSON-based file storage (lib/db/...)                        │
│  - CRUD operations                                           │
│  - Data serialization/deserialization                        │
│  - In-memory data structures (contacts, tasks)              │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Layer Descriptions

### 1. Presentation Layer

**Location:** `app/`, `components/`, `hooks/`

**Responsibilities:**
- Render user interface
- Capture user input
- Display data in user-friendly format
- Manage local component state
- Handle user interactions (click, submit, etc)

**Key Components:**
- `app/page.tsx` - Main application page (two-column layout)
- `app/contacts/new/page.tsx` - Create contact page
- `app/contacts/[contactId]/edit/page.tsx` - Edit contact page
- `components/ContactList.tsx` - Paginated, sortable contact list with search
- `components/ContactForm.tsx` - Reusable form for creating/editing contacts
- `components/TaskForm.tsx` - Task creation form
- `components/TaskList.tsx` - Task list with toggle/delete
- `components/Toast.tsx` - Notification system

**Design Decisions:**
- **Functional Components**: All components use React function components with hooks
- **No State Management**: Uses only React hooks (useState, useEffect) for simplicity
- **Separation of Concerns**: Components focus on UI only, business logic in services
- **Reusable Components**: ContactForm used in both create and edit pages
- **Custom Hooks**: useForm (form validation), useAsync (data fetching), useToast (notifications)

---

### 2. API Layer (Route Handlers)

**Location:** `app/api/`

**Responsibilities:**
- Receive HTTP requests from client
- Validate request format and parameters
- Invoke appropriate service layer methods
- Format responses consistently
- Return HTTP status codes
- Catch and handle errors

**Route Structure:**

```
app/api/
├── contacts/
│   ├── route.ts                    # GET all, POST create
│   └── [contactId]/
│       ├── route.ts                # GET one, PUT update, DELETE
│       └── tasks/
│           ├── route.ts            # GET all, POST create
│           └── [taskId]/
│               └── route.ts        # GET, PUT, PATCH, DELETE
└── route/                          # Health check
    └── route.ts
```

**Request Flow Example: Create Contact**

```
1. Client: POST /api/contacts with JSON body
   ↓
2. API Route: Extract body, validate format
   ↓
3. Service Layer: contactService.createContact(data)
   ↓
4. Database Layer: db.contacts.create(validated)
   ↓
5. Response: HTTP 201 with created contact
```

**Response Format Standard:**

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}
```

**Status Code Convention:**
- `200` - GET success, PUT success, DELETE success
- `201` - POST success (resource created)
- `400` - Validation failed
- `404` - Resource not found
- `500` - Server error

---

### 3. Service Layer (Business Logic)

**Location:** `services/`

**Responsibilities:**
- Implement business rules and validation
- Orchestrate database operations
- Handle data transformation
- Maintain data consistency
- Provide error messages
- No direct HTTP knowledge

**Services:**

#### ContactService (`services/contactService.ts`)

```typescript
// Exported functions
- getAllContacts(search?: string): Contact[]
- getContactById(id: string): Contact | null
- createContact(data: CreateContactInput): Contact
- updateContact(id: string, data: UpdateContactInput): Contact | null
- deleteContact(id: string): boolean
- searchContacts(term: string): Contact[]
- sortContacts(contacts: Contact[], sortBy: string, direction: string): Contact[]
```

**Key Methods:**

1. **getAllContacts()**
   - Returns all contacts from database
   - If search term provided, filters by name/email
   - Used by API GET /contacts endpoint

2. **getContactById(id)**
   - Retrieves single contact by ID
   - Returns null if not found
   - Used by API GET /contacts/{id} endpoint

3. **createContact(data)**
   - Validates input using contactValidator
   - Generates unique ID
   - Adds timestamp
   - Persists to database
   - Returns created contact

4. **updateContact(id, data)**
   - Validates partial updates using contactValidator
   - Merges with existing contact
   - Persists changes
   - Returns updated contact or null if not found

5. **deleteContact(id)**
   - Deletes contact from database
   - Also deletes all associated tasks (cascade delete)
   - Returns success boolean

6. **searchContacts(term)**
   - Case-insensitive search in name and email
   - Returns matching contacts
   - Called by getAllContacts when search term provided

7. **sortContacts(contacts, sortBy, direction)**
   - Sorts array by: name, email, or createdAt
   - Direction: asc or desc
   - Returns sorted array

#### TaskService (`services/taskService.ts`)

```typescript
// Exported functions
- getTasksByContact(contactId: string): Task[]
- getTaskById(contactId: string, taskId: string): Task | null
- createTask(contactId: string, data: CreateTaskInput): Task
- updateTask(contactId: string, taskId: string, data: UpdateTaskInput): Task | null
- toggleTaskCompletion(contactId: string, taskId: string): Task | null
- deleteTask(taskId: string): boolean
```

**Key Methods:**

1. **getTasksByContact(contactId)**
   - Retrieves all tasks for a contact
   - Returns empty array if contact not found
   - Used by API GET /contacts/{id}/tasks

2. **createTask(contactId, data)**
   - Validates contactId exists
   - Validates task data using taskValidator
   - Generates unique task ID
   - Adds timestamps
   - Persists to database
   - Returns created task

3. **updateTask(contactId, taskId, data)**
   - Validates task and contact exist
   - Validates partial updates
   - Updates task fields
   - Updates timestamp
   - Returns updated task or null

4. **toggleTaskCompletion(contactId, taskId)**
   - Flips completed boolean
   - Updates updatedAt timestamp
   - Returns updated task or null

5. **deleteTask(taskId)**
   - Deletes task by ID
   - Returns success boolean
   - Used by API DELETE endpoint

---

### 4. Database Layer (Persistence)

**Location:** `lib/db/`

**Responsibilities:**
- Read/write JSON files
- Maintain in-memory data structures
- Provide CRUD operations
- Handle data serialization
- No business logic, only data operations

**Structure:**

```
lib/db/
├── contacts/
│   ├── contacts.json      # 500 sample contacts
│   └── index.ts           # CRUD operations for contacts
└── tasks/
    ├── tasks.json         # 60 sample tasks
    └── index.ts           # CRUD operations for tasks
```

**Contacts Database (`lib/db/contacts/index.ts`)**

```typescript
// Exported functions
- getAllContacts(): Contact[]
- getContactById(id: string): Contact | null
- createContact(contact: Contact): Contact
- updateContact(id: string, updates: Partial<Contact>): Contact | null
- deleteContact(id: string): boolean
```

**How it Works:**
1. On application start, JSON file is read into memory
2. All operations work on in-memory array
3. After each write operation, array is synced back to JSON file
4. This ensures data persists across server restarts

**Contact Object Structure:**
```typescript
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;  // ISO timestamp
}
```

**Tasks Database (`lib/db/tasks/index.ts`)**

```typescript
// Exported functions
- getTasksByContact(contactId: string): Task[]
- getTaskById(taskId: string): Task | null
- getAllTasks(): Task[]
- createTask(task: Task): Task
- updateTask(taskId: string, updates: Partial<Task>): Task | null
- deleteTask(taskId: string): boolean
- deleteTasksByContact(contactId: string): boolean  // Cascade delete
```

**Task Object Structure:**
```typescript
interface Task {
  id: string;
  contactId: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;    // ISO date YYYY-MM-DD
  createdAt: string;   // ISO timestamp
  updatedAt: string;   // ISO timestamp
}
```

**Cascade Delete:**
When a contact is deleted, all its associated tasks are automatically deleted via `deleteTasksByContact(contactId)` called from contactService.

---

## Data Flow Diagrams

### Create Contact Flow

```
User fills form
        ↓
ContactForm component
        ↓
POST /api/contacts with form data
        ↓
API Route validates format
        ↓
contactService.createContact(data)
        ↓
contactValidator.validateContact(data)
        ↓
contactService validates
        ↓
db.contacts.create(contact)
        ↓
Write to contacts.json
        ↓
Return 201 with new contact
        ↓
Component receives response
        ↓
Show toast success
        ↓
Redirect to main page
```

### List and Search Contacts Flow

```
Page loads
        ↓
useAsync fetches GET /api/contacts
        ↓
API Route calls contactService.getAllContacts()
        ↓
Service returns all contacts or filtered if search term
        ↓
Return 200 with contacts array
        ↓
Component renders ContactList
        ↓
Display pagination + search results
```

### Task Toggle Flow

```
User clicks checkbox
        ↓
TaskList component
        ↓
PATCH /api/contacts/{id}/tasks/{id}
        ↓
API Route calls taskService.toggleTaskCompletion(id, id)
        ↓
Service flips completed boolean
        ↓
db.tasks.updateTask() writes change
        ↓
Return 200 with updated task
        ↓
Component updates local state
        ↓
UI reflects checked/unchecked
        ↓
Show toast success
```

---

## Validation Architecture

**Validators Location:** `lib/validators/`

### Contact Validator

```typescript
// lib/validators/contact.validator.ts
export function validateContact(data: unknown): { valid: boolean; errors: Record<string, string> }

// Validation rules:
- name: 2-100 characters, required
- email: Valid email format, required
- phone: Format 555-XXXX, required
- address: 3-200 characters, required
```

**Usage in Service:**
```typescript
const { valid, errors } = validateContact(data);
if (!valid) throw new Error(formatErrors(errors));
```

### Task Validator

```typescript
// lib/validators/task.validator.ts
export function validateTask(data: unknown, partial?: boolean): { valid: boolean; errors: Record<string, string> }

// Validation rules:
- contactId: Must exist in contacts database, required
- title: 2-200 characters, required
- description: 0-500 characters, optional
- dueDate: Valid ISO date format, optional
```

**Partial Updates:**
When updating tasks (PUT), only provided fields are validated via `partial: true` flag.

---

## Error Handling Strategy

### Error Categories

**1. Validation Errors**
- **Source**: Validators
- **Handled by**: Services catch and re-throw with formatted message
- **Response**: HTTP 400 with detailed error messages
- **Example**: "Validation failed: email: Invalid email format"

**2. Not Found Errors**
- **Source**: Database operations return null
- **Handled by**: Services and API routes
- **Response**: HTTP 404 with "not found" message
- **Example**: "Contact with ID 999 not found"

**3. Server Errors**
- **Source**: Unexpected exceptions (file I/O, JSON parse, etc)
- **Handled by**: API route try/catch blocks
- **Response**: HTTP 500 with generic error message
- **Example**: "Failed to fetch contacts"

### Error Flow

```
Try operation
    ↓
Exception thrown
    ↓
Catch block
    ↓
Determine error type
    ↓
Format error message
    ↓
Log to console (development)
    ↓
Return appropriate HTTP response
    ↓
Client receives error
    ↓
Toast notification displayed
```

---

## Type Safety

**TypeScript Configuration:** `tsconfig.json` with `strict: true`

**Key Types:**

```typescript
// Contact type
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

// Task type
interface Task {
  id: string;
  contactId: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response type
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}
```

**Type Definitions Location:** `types/`
- `contact.types.ts` - Contact-related types
- `task.types.ts` - Task-related types

---

## Scalability Considerations

### Current Limitations

1. **JSON File Storage**: Data stored in JSON files, not database
   - Suitable for: Learning, demonstrations, small projects
   - Not suitable for: Production with high traffic, concurrent writes

2. **In-Memory Operations**: All data loaded into memory
   - Suitable for: ~1000 contacts
   - Not suitable for: Millions of contacts

3. **Single Server**: No distributed architecture
   - Suitable for: Single machine deployment
   - Not suitable for: High availability requirements

### Migration Path to Database

To migrate to a real database (PostgreSQL, MongoDB, etc):

1. Replace `lib/db/` with database queries
2. Update service layer to use async/await
3. Modify API routes to handle promises
4. Add connection pooling and error handling
5. No changes needed to UI layer (abstracted by services)

**Example:**
```typescript
// Before (JSON)
const contacts = db.contacts.getAllContacts();

// After (PostgreSQL)
const contacts = await db.query('SELECT * FROM contacts');
```

---

## State Management

**Approach**: React Hooks + API fetching

**Why not Redux/Zustand?**
- Application is simple with linear data flow
- No complex shared state between distant components
- Each page/component fetches its own data
- Reduces bundle size and complexity

**State Locations:**
1. **Local Component State**: Form inputs, UI toggles (useState)
2. **Server State**: Contacts list, tasks (fetched via API)
3. **URL Parameters**: contactId for edit/view pages

**Custom Hooks:**
- `useForm()`: Manages form validation and submission
- `useAsync()`: Manages async API calls and loading/error states
- `useToast()`: Manages notification queue and display

---

## Performance Optimizations

### Pagination

- **Implementation**: 10 contacts per page
- **Benefit**: Reduces rendering load, improves perceived performance
- **Calculation**: `(currentPage - 1) * 10` offset

### Search Debouncing

- **Delay**: 500ms debounce on search input
- **Benefit**: Reduces API calls while typing
- **Implementation**: Custom useAsync hook with debounce

### Sorting

- **Client-side**: Contacts sorted in component
- **Benefit**: No additional API calls for sort direction change
- **Options**: name, email, createdAt (asc/desc)

### Responsive Design

- **Breakpoint**: 768px (mobile/tablet split)
- **Mobile**: Single column, stacked controls
- **Desktop**: Two columns, side-by-side layout

---

## Testing Architecture

### Unit Tests (Jest)

**Location**: `__tests__/unit/`

**Coverage:**
- `services/contactService.test.ts`: 30 tests
  - CRUD operations
  - Search and sort logic
  - Validation integration
  
- `services/taskService.test.ts`: 23 tests
  - CRUD operations
  - Cascade delete
  - Validation integration

- `validators/validators.test.ts`: 16 tests
  - Validation rules
  - Edge cases
  - Error messages

**Testing Approach:**
- Mock database layer
- Test service logic in isolation
- Verify correct errors thrown for invalid input
- Test business rules (e.g., cascade delete)

### E2E Tests (Playwright)

**Location**: `__tests__/e2e/app.spec.ts`

**Coverage:**
- User workflows (create, read, update, delete)
- Pagination navigation
- Search functionality
- Sorting
- Task management
- Toast notifications
- Responsive design
- Error scenarios

**Testing Approach:**
- Test from user perspective
- Simulate real browser interactions
- Verify UI reflects state changes
- Test across viewport sizes

---

## Development Guidelines

### Adding a New Feature

1. **Define Type** in `types/`
2. **Add Database Operations** in `lib/db/`
3. **Add Service Methods** in `services/`
4. **Add Validators** in `lib/validators/`
5. **Create API Route** in `app/api/`
6. **Create UI Component** in `components/`
7. **Create Tests** in `__tests__/`
8. **Test Manually** via browser

### Code Organization Principle

**"Move logic outward from UI"**

```
UI Components (dumb)
         ↓
API Routes (request handling)
         ↓
Services (business logic)
         ↓
Database (persistence)
```

Each layer should be testable in isolation.

---

## Future Enhancements

### Short-term

- [ ] Add authentication/authorization
- [ ] Add contact notes/comments
- [ ] Add task reminders/notifications
- [ ] Add recurring tasks
- [ ] Add task categories/labels

### Medium-term

- [ ] Migrate to real database (PostgreSQL)
- [ ] Add cloud file storage (S3)
- [ ] Add email notifications
- [ ] Add calendar view for tasks
- [ ] Add contact groups

### Long-term

- [ ] Add analytics/reporting
- [ ] Add mobile app (React Native)
- [ ] Add real-time collaboration
- [ ] Add backup/restore
- [ ] Add third-party integrations

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0
