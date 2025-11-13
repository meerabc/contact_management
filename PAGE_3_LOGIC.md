## Page 3: Main Page (app/page.tsx) - Code Structure Explanation

### Overview

The main page is a **two-column layout** showing:

- **Left (Sidebar)**: Contact List with search
- **Right (Main)**: Selected Contact Detail + Task Management

---

## HOOKS USED (Minimal - Only What's Needed)

### 1. `useState` - 4 states only

```typescript
const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
const [tasks, setTasks] = useState<Task[]>([]);
const [showTaskForm, setShowTaskForm] = useState(false);
const [loading, setLoading] = useState(false);
```

- **selectedContact**: Currently selected contact from sidebar
- **tasks**: List of tasks for selected contact
- **showTaskForm**: Toggle to show/hide task creation form
- **loading**: Show loading state while fetching tasks

### 2. `useEffect` - Only 1, triggered when contact changes

```typescript
useEffect(() => {
  if (!selectedContact) return;

  // Fetch tasks for this contact
  const fetchTasks = async () => { ... };
  fetchTasks();
}, [selectedContact]); // Dependency: only runs when selectedContact changes
```

**Why only 1 useEffect?**

- Fetches tasks when user selects a contact
- No need for other effects - form state is local, contact search is in ContactList

---

## EVENT HANDLERS (Clear & Purposeful)

### 1. `handleTaskCreated` - Add new task to list

```typescript
const handleTaskCreated = (newTask: Task) => {
  setTasks([...tasks, newTask]); // Optimistic update - don't refetch
  setShowTaskForm(false);
};
```

**Purpose**: When TaskForm successfully creates task, add it to state immediately

### 2. `handleTaskToggled` - Update task completion

```typescript
const handleTaskToggled = (updatedTask: Task) => {
  setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
};
```

**Purpose**: When user clicks checkbox, update that task in the list

### 3. `handleTaskDeleted` - Remove task from list

```typescript
const handleTaskDeleted = (taskId: string) => {
  setTasks(tasks.filter((t) => t.id !== taskId));
};
```

**Purpose**: When delete succeeds, remove from UI

### 4. Contact delete inline handler

```typescript
onClick={() => {
  if (confirm('Delete this contact and all its tasks?')) {
    fetch(`/api/contacts/${selectedContact.id}`, { method: 'DELETE' })
      .then(() => setSelectedContact(null));
  }
}}
```

**Purpose**: Delete contact + clear selection

---

## COMPONENTS HIERARCHY

```
app/page.tsx (Main Page - 'use client')
├── ContactList (Sidebar)
│   ├── Fetches all contacts
│   ├── Handles search
│   ├── Calls onSelectContact when clicked
│   └── Shows selected highlight
│
├── TaskList (Main - Tasks Display)
│   ├── Receives tasks array
│   ├── Handles toggle (PATCH request)
│   ├── Handles delete (DELETE request)
│   └── Calls callbacks to update parent state
│
└── TaskForm (Main - Task Creation)
    ├── Form inputs (title, description, dueDate)
    ├── Handles POST request
    ├── Calls onTaskCreated callback
    └── Shows/hides based on showTaskForm state
```

---

## DATA FLOW (Unidirectional)

```
SELECT CONTACT
  ↓
useEffect triggers → API call GET /api/contacts/{id}/tasks
  ↓
setTasks(data) → UI updates
  ↓
User clicks task checkbox
  ↓
TaskList.handleToggleTask() → PATCH /api/contacts/{id}/tasks/{taskId}
  ↓
onTaskToggled(updatedTask) → parent updates state
  ↓
UI re-renders

---

CREATE TASK
  ↓
TaskForm.onSubmit() → POST /api/contacts/{id}/tasks
  ↓
onTaskCreated(newTask) → parent adds to state
  ↓
UI updates, form closes
```

---

## WHY NO CONTEXT/REDUX?

❌ **Not needed** - This app has:

- Only 1 main page with local state
- 3 simple states (contact, tasks, UI flags)
- No deep nesting requiring prop drilling
- Each component is self-contained

✅ **Keep it simple**: useState + props is enough

---

## CSS APPROACH

**Used**: Global CSS classes (NO CSS Modules, NO Tailwind)

**Files**:

- `app/globals.css` - All styles in one place (easy to find)
  - `.main-container` - Two-column layout
  - `.sidebar` - Left contact list
  - `.main-content` - Right content area
  - `.contact-item` - Clickable contacts
  - `.task-item` - Task rows
  - `.task-form` - Form styling
  - `.btn-primary`, `.btn-secondary`, `.btn-danger` - Button styles

**Why global CSS?**

- Small project = easier to maintain
- All styles visible in one file
- No component-specific overrides needed

---

## KEY LOGICAL PATTERNS

### 1. **Optimistic UI Updates**

```typescript
// Update immediately, don't wait for server
const handleTaskToggled = (updatedTask: Task) => {
  setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
};
```

### 2. **Debounced Search** (in ContactList)

```typescript
useEffect(() => {
  const timer = setTimeout(() => fetchContacts(), 500); // Wait 500ms after typing
  return () => clearTimeout(timer); // Cleanup
}, [search]);
```

### 3. **Confirmation Dialogs**

```typescript
if (!confirm('Delete this contact and all its tasks?')) return;
// Only proceed if user confirms
```

### 4. **Conditional Rendering**

```typescript
{selectedContact ? (
  <div>Show detail</div>
) : (
  <div>Show placeholder</div>
)}
```

### 5. **Loading States**

```typescript
{loading ? <p>Loading...</p> : <TaskList tasks={tasks} />}
```

---

## SUMMARY

**Page 3 (Main Page) Features**:

- ✅ Two-column layout (Sidebar + Main)
- ✅ Contact selection with visual feedback
- ✅ Task list with toggle & delete
- ✅ Task creation form (inline)
- ✅ Optimistic UI updates (no full refetch)
- ✅ Minimal hooks (only useState + 1 useEffect)
- ✅ Global CSS (single stylesheet)
- ✅ Clear event handlers for each action
- ✅ Unidirectional data flow
- ✅ No unnecessary context/state management

**Result**: Clean, readable, production-ready UI with **focus on code structure over visual complexity**.
