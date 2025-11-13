# Contact Manager - Next.js Application

A production-ready **Contact & Task Manager** built with Next.js 14, React, TypeScript, and a clean layered architecture.

## ✨ Features

- **Contact Management**
  - View 500+ contacts with pagination (10 per page)
  - Search contacts by name or email (debounced, 500ms)
  - Sort by name, email, or creation date (ascending/descending)
  - Create, edit, and delete contacts
  - Validation for all input fields

- **Task Management**
  - Create tasks linked to contacts
  - Mark tasks as complete/incomplete
  - Set due dates and descriptions
  - Delete tasks with confirmation
  - Cascade delete (tasks removed when contact deleted)

- **User Experience**
  - Toast notifications for all operations (success/error)
  - Two-column layout: contact list sidebar + detail pane
  - Real-time validation and error messages
  - Responsive design (mobile, tablet, desktop)
  - Loading states and empty states

- **Code Quality**
  - Full TypeScript with strict mode
  - ESLint + Prettier for code standards
  - 69+ unit tests (Jest)
  - E2E tests (Playwright)
  - Clean layered architecture

## 📂 Project Structure

```
app/
├── globals.css              # All styling (600+ lines, no modules/Tailwind)
├── layout.tsx               # Root layout
├── page.tsx                 # Main page (two-column layout)
├── api/contacts/
│   ├── route.ts             # GET all, POST create
│   └── [contactId]/
│       ├── route.ts         # GET one, PUT update, DELETE
│       └── tasks/
│           ├── route.ts     # GET tasks, POST create
│           └── [taskId]/
│               └── route.ts # PATCH toggle, PUT update, DELETE
├── contacts/
│   ├── new/page.tsx         # Create contact
│   └── [contactId]/edit/page.tsx  # Edit contact

components/
├── ContactList.tsx          # List with pagination & sorting
├── ContactForm.tsx          # Create/edit form
├── TaskList.tsx             # Task display & management
├── TaskForm.tsx             # Create task
├── Toast.tsx                # Notifications

lib/
├── db/contacts/
│   ├── contacts.json        # 500 sample contacts
│   └── index.ts             # CRUD operations
├── db/tasks/
│   ├── tasks.json           # 60+ sample tasks
│   └── index.ts             # CRUD operations
├── validators/
│   ├── contact.validator.ts # Name, email, phone, address validation
│   └── task.validator.ts    # Title, description, dueDate validation

services/
├── contactService.ts        # Contact business logic
└── taskService.ts           # Task business logic

types/
├── contact.types.ts         # Contact interfaces
└── task.types.ts            # Task interfaces

__tests__/
├── unit/
│   ├── services/
│   │   ├── contactService.test.ts  # 30 tests
│   │   └── taskService.test.ts     # 23 tests
│   └── validators/
│       └── validators.test.ts      # 16 tests
└── e2e/
    └── app.spec.ts          # Playwright E2E tests
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Port 3000 available

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build & Run

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📋 Available Scripts

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server
npm test                 # Run Jest unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run Playwright E2E tests
npm run lint            # Check code with ESLint
npm run format          # Format code with Prettier
npm run format:check    # Check formatting without changes
npm run type-check      # Run TypeScript type checking
```

## 🏗️ Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────┐
│      UI Components (React)          │
│  - ContactList, ContactForm, etc    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      API Routes (Next.js)           │
│  - /api/contacts, /api/tasks, etc   │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│    Service Layer (Business Logic)   │
│  - contactService, taskService      │
│  - Validation & error handling      │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│   Database Layer (Persistence)      │
│  - contacts.json, tasks.json        │
│  - CRUD operations                  │
└─────────────────────────────────────┘
```

### Data Flow

1. **Component** → calls API route via `fetch()`
2. **API Route** → validates request, calls service layer
3. **Service Layer** → validates data, calls database, returns result
4. **Database Layer** → reads/writes JSON files
5. **Response** → returned through service → API → component

### Validation Flow

Each layer validates independently:
- **Component**: Basic form validation (UI feedback)
- **API**: Request validation (400 errors)
- **Service**: Business logic validation
- **Database**: Type safety (TypeScript)

## 📊 Data Models

### Contact
```typescript
interface Contact {
  id: string;              // UUID
  name: string;            // 2-100 chars
  email: string;           // Valid email format
  phone: string;           // Format: 555-XXXX
  address: string;         // 3-200 chars
  createdAt: string;       // ISO timestamp
}
```

### Task
```typescript
interface Task {
  id: string;              // UUID
  contactId: string;       // Reference to contact
  title: string;           // 2-200 chars
  description?: string;    // 0-500 chars
  completed: boolean;      // Toggle status
  dueDate?: string;        // ISO date (YYYY-MM-DD)
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}
```

## 🔗 API Endpoints

### Contacts

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/contacts` | Get all contacts (paginated) |
| GET | `/api/contacts?search=query` | Search contacts |
| GET | `/api/contacts/{id}` | Get single contact |
| POST | `/api/contacts` | Create contact |
| PUT | `/api/contacts/{id}` | Update contact |
| DELETE | `/api/contacts/{id}` | Delete contact + tasks |

### Tasks

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/contacts/{contactId}/tasks` | Get tasks for contact |
| POST | `/api/contacts/{contactId}/tasks` | Create task |
| PUT | `/api/contacts/{contactId}/tasks/{taskId}` | Update task |
| PATCH | `/api/contacts/{contactId}/tasks/{taskId}` | Toggle completion |
| DELETE | `/api/contacts/{contactId}/tasks/{taskId}` | Delete task |

## ✅ Testing

### Unit Tests (Jest)

```bash
npm test
# Results:
# - Contact Service: 30 tests
# - Task Service: 23 tests
# - Validators: 16 tests
# Total: 69 tests, 100% passing
```

**Coverage:**
- Service layer business logic
- Validation rules
- Error handling
- Edge cases

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

**Coverage:**
- Contact list & pagination
- Search & sorting
- Create/edit/delete contacts
- Task management
- Toast notifications
- Error handling
- Responsive design

## 🎨 Styling

- **Pure CSS** (no CSS Modules, no Tailwind)
- **Global stylesheet** (`app/globals.css`)
- **Responsive design** with media queries
- **600+ lines** of organized, clean CSS
- **BEM-style naming** for clarity

### Key Classes

- `.main-container` - Two-column layout
- `.sidebar` - Contact list sidebar
- `.main-content` - Detail & tasks pane
- `.contact-list-container` - Contact list wrapper
- `.pagination` - Page navigation
- `.toast-*` - Toast notifications (success/error/warning/info)
- `.error-message` - Error display
- `.empty-state` - No data state
- `.loading` - Loading indicator

## 🔐 Validation Rules

### Contact Validation

- **Name**: Required, 2-100 characters
- **Email**: Required, valid email format
- **Phone**: Required, format `555-XXXX` (555-0000 to 555-9999)
- **Address**: Required, 3-200 characters

### Task Validation

- **Contact ID**: Required, must exist
- **Title**: Required, 2-200 characters
- **Description**: Optional, max 500 characters
- **Due Date**: Optional, valid ISO date format (YYYY-MM-DD)

## 🚨 Error Handling

All errors display as toast notifications:

- **Success** (green): Operation completed
- **Error** (red): Operation failed with reason
- **Warning** (orange): Important notice
- **Info** (blue): General information

Features:
- Auto-dismiss after 3 seconds
- Click to dismiss immediately
- Smooth animations
- Non-blocking UI

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px
  - Full-height layout (stacked)
  - Single column
  - Touch-friendly buttons

- **Tablet/Desktop**: ≥ 768px
  - Two-column layout
  - Side-by-side display
  - Hover effects

## 🔍 Search & Filter

### Search
- Debounced input (500ms delay)
- Search by name or email
- Case-insensitive
- Returns all matches

### Sort
- By Name (alphabetical)
- By Email (alphabetical)
- By Date Created (newest/oldest)
- Ascending/Descending toggle

### Pagination
- 10 contacts per page
- Previous/Next navigation
- Page info display
- Reset on search

## 🛠️ Development

### Code Style

- **ESLint**: Strict Next.js config
- **Prettier**: Automatic formatting
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase variables, PascalCase components

### Before Committing

```bash
npm run lint      # Check for errors
npm run format    # Auto-format code
npm test          # Run unit tests
```

## 📚 Documentation Files

- `README.md` (this file) - Overview & setup
- `ARCHITECTURE.md` - Detailed architecture decisions
- `API_DOCS.md` - API endpoints & examples
- `TESTING.md` - Testing strategy & coverage
- `PAGE_3_LOGIC.md` - Main page component logic

## 🐛 Known Limitations

- Data persists in JSON files (in-memory on server restart)
- No user authentication
- No database transactions
- No real-time updates
- Single-server deployment only

## 🚀 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication & authorization
- [ ] Real-time updates (WebSockets)
- [ ] Advanced filtering (date ranges, tags)
- [ ] Bulk operations (multi-select)
- [ ] Export to CSV/PDF
- [ ] Activity logging
- [ ] Undo/redo functionality

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Testing](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)

## 📝 License

Private project for assessment purposes.

## 👤 Author

Created as a full-stack Next.js assessment project.

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0
