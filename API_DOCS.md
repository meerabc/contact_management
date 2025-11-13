# API Documentation

Complete REST API reference for the Contact Manager application.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All responses are JSON with the following structure:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "total": 500
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

## Contacts API

### Get All Contacts

Retrieve paginated list of all contacts.

**Endpoint:** `GET /api/contacts`

**Query Parameters:**
- `search` (optional): Search term to filter by name/email

**Example:**
```bash
GET /api/contacts
GET /api/contacts?search=alice
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "phone": "555-1234",
      "address": "123 Main St",
      "createdAt": "2025-01-01T08:00:00Z"
    },
    // ... more contacts
  ],
  "total": 500
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### Get Single Contact

Retrieve a specific contact by ID.

**Endpoint:** `GET /api/contacts/{contactId}`

**Path Parameters:**
- `contactId` (required): Unique contact ID

**Example:**
```bash
GET /api/contacts/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "phone": "555-1234",
    "address": "123 Main St",
    "createdAt": "2025-01-01T08:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Contact not found
- `500` - Server error

---

### Create Contact

Create a new contact.

**Endpoint:** `POST /api/contacts`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "555-5678",
  "address": "456 Oak Ave, City, State 12345"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `phone`: Required, format `555-XXXX`
- `address`: Required, 3-200 characters

**Example:**
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-5678",
    "address": "456 Oak Ave"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "501",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-5678",
    "address": "456 Oak Ave",
    "createdAt": "2025-11-13T12:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation failed
- `500` - Server error

**Error Example:**
```json
{
  "success": false,
  "error": "Validation failed: email: Invalid email format; phone: Invalid phone format"
}
```

---

### Update Contact

Update an existing contact.

**Endpoint:** `PUT /api/contacts/{contactId}`

**Path Parameters:**
- `contactId` (required): Contact to update

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-9999",
  "address": "789 Pine Ln"
}
```

**Notes:**
- All fields are optional but validated if provided
- Only provided fields are updated

**Example:**
```bash
curl -X PUT http://localhost:3000/api/contacts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "555-1234",
    "address": "123 Main St",
    "createdAt": "2025-01-01T08:00:00Z"
  }
}
```

**Status Codes:**
- `200` - Updated
- `400` - Validation failed
- `404` - Contact not found
- `500` - Server error

---

### Delete Contact

Delete a contact and all associated tasks (cascade delete).

**Endpoint:** `DELETE /api/contacts/{contactId}`

**Path Parameters:**
- `contactId` (required): Contact to delete

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/contacts/1
```

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

**Status Codes:**
- `200` - Deleted
- `404` - Contact not found
- `500` - Server error

---

## Tasks API

### Get Tasks for Contact

Retrieve all tasks for a specific contact.

**Endpoint:** `GET /api/contacts/{contactId}/tasks`

**Path Parameters:**
- `contactId` (required): Contact ID

**Example:**
```bash
GET /api/contacts/1/tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "contactId": "1",
      "title": "Follow up on project",
      "description": "Check status with client",
      "completed": false,
      "dueDate": "2025-02-15",
      "createdAt": "2025-01-10T08:00:00Z",
      "updatedAt": "2025-01-10T08:00:00Z"
    },
    // ... more tasks
  ],
  "total": 3
}
```

**Status Codes:**
- `200` - Success
- `404` - Contact not found
- `500` - Server error

---

### Create Task

Create a new task for a contact.

**Endpoint:** `POST /api/contacts/{contactId}/tasks`

**Path Parameters:**
- `contactId` (required): Contact to create task for

**Request Body:**
```json
{
  "title": "Send proposal",
  "description": "Send updated proposal to client",
  "dueDate": "2025-02-20"
}
```

**Validation Rules:**
- `title`: Required, 2-200 characters
- `description`: Optional, max 500 characters
- `dueDate`: Optional, valid ISO date (YYYY-MM-DD)

**Example:**
```bash
curl -X POST http://localhost:3000/api/contacts/1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Send proposal",
    "description": "Send updated proposal",
    "dueDate": "2025-02-20"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "61",
    "contactId": "1",
    "title": "Send proposal",
    "description": "Send updated proposal",
    "completed": false,
    "dueDate": "2025-02-20",
    "createdAt": "2025-11-13T12:00:00Z",
    "updatedAt": "2025-11-13T12:00:00Z"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation failed
- `404` - Contact not found
- `500` - Server error

---

### Update Task

Update a task's details.

**Endpoint:** `PUT /api/contacts/{contactId}/tasks/{taskId}`

**Path Parameters:**
- `contactId` (required): Contact ID
- `taskId` (required): Task to update

**Request Body:**
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2025-02-25"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/contacts/1/tasks/5 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated title"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "5",
    "contactId": "1",
    "title": "Updated title",
    "description": "Original description",
    "completed": false,
    "dueDate": "2025-02-20",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-11-13T12:15:00Z"
  }
}
```

**Status Codes:**
- `200` - Updated
- `400` - Validation failed
- `404` - Task or contact not found
- `500` - Server error

---

### Toggle Task Completion

Toggle a task's completed status.

**Endpoint:** `PATCH /api/contacts/{contactId}/tasks/{taskId}`

**Path Parameters:**
- `contactId` (required): Contact ID
- `taskId` (required): Task to toggle

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/contacts/1/tasks/5
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "5",
    "contactId": "1",
    "title": "Send proposal",
    "description": "Send proposal to client",
    "completed": true,
    "dueDate": "2025-02-20",
    "createdAt": "2025-01-10T08:00:00Z",
    "updatedAt": "2025-11-13T12:15:00Z"
  }
}
```

**Status Codes:**
- `200` - Toggled
- `404` - Task or contact not found
- `500` - Server error

---

### Delete Task

Delete a task.

**Endpoint:** `DELETE /api/contacts/{contactId}/tasks/{taskId}`

**Path Parameters:**
- `contactId` (required): Contact ID
- `taskId` (required): Task to delete

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/contacts/1/tasks/5
```

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

**Status Codes:**
- `200` - Deleted
- `404` - Task or contact not found
- `500` - Server error

---

## Error Handling

### Validation Errors (400)

Multiple validation errors are returned together:

```json
{
  "success": false,
  "error": "Validation failed: name: Name must be 2-100 characters; email: Invalid email format; phone: Invalid phone format"
}
```

### Not Found Errors (404)

```json
{
  "success": false,
  "error": "Contact with ID 999 not found"
}
```

### Server Errors (500)

```json
{
  "success": false,
  "error": "Failed to create contact"
}
```

## Rate Limiting

No rate limiting implemented in current version.

## Authentication

No authentication required in current version.

## CORS

CORS is enabled for all origins in development.

---

**Last Updated**: November 13, 2025
**Version**: 1.0.0
