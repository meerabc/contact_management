# Contact Management System

A simple contact and task management application built with Next.js.

## Features

- Create, view, edit, and delete contacts
- Each contact can have multiple tasks
- Search contacts by name or email
- Sort contacts by name or email
- Dark neon theme UI
- Form validation for all inputs
- Phone numbers must be unique

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open http://localhost:3000 in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

- `app/` - Next.js pages and API routes
- `components/` - React components
- `lib/db/` - Database layer (JSON files)
- `services/` - Business logic
- `types/` - TypeScript type definitions
- `__tests__/` - Test files

## Tech Stack

- Next.js 14
- React
- TypeScript
- CSS (no frameworks)
