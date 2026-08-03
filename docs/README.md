# Todo Application

A local-first todo application built with Next.js and SQLite.

## Third-Party Code

| Package | Reason |
|---------|--------|
| `better-sqlite3` | SQLite database engine for Node.js |
| `next` | React framework for building the application |
| `react` | UI library |
| `react-dom` | React DOM rendering |
| `tailwindcss` | CSS styling |

## Database Design

The application uses a single table `tasks` with the following schema:

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER PRIMARY KEY | Unique identifier (auto-increment) |
| `title` | TEXT NOT NULL | Task title |
| `description` | TEXT | Task description (optional) |
| `due_date` | TEXT NOT NULL | Due date in YYYY-MM-DD format |
| `topic` | TEXT NOT NULL | Task category/topic |
| `status` | TEXT NOT NULL | One of: 'Todo', 'In-Progress', 'Complete' |
| `archived` | BOOLEAN | 0 = active, 1 = archived (tasks are never deleted) |
| `created_at` | TEXT | Auto-set to current timestamp |

### Relationships
- Single table design (no foreign keys)
- `status` is constrained to exactly three values: 'Todo', 'In-Progress', 'Complete'
- `archived` flag enables soft-delete (tasks are never permanently removed)
- `overdue` is **derived at read time** by comparing `due_date` with current date
- Archived tasks remain viewable when "Show archived" is enabled

## Running the Application

### Requirements
- Node.js 18 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/2843941/todo-app.git
cd todo-app

# Install dependencies
npm install
```

### Running the Application

```bash
npm run dev
```

I Open http://localhost:3000 in browser.

### Running Tests

```bash
npm test
```

### Usage

1. Open http://localhost:3000 in browser
2. Create a task by filling in the form (Title, Description, Due Date, Topic, Status)
3. Click "Create Task" to save
4. View all tasks in the list below
5. Click "Edit" to modify a task's details
6. Click "Archive" to archive a task (it will be hidden from active list)
7. Toggle "Show archived" checkbox to view archived tasks
8. Use the "Sort by" dropdown to sort tasks by Topic, Status, or Due Date
9. Use the "Filter by status" dropdown to show only Todo, In-Progress, or Complete tasks
10. Tasks with a past due date will show a red border and "OVERDUE" label

### Data Persistence
- All data is stored in a SQLite database file (`database/todo.db`)
- Data persists across application restarts
- No user accounts required - single user on the machine

## AI Declaration

This repository makes use of AI code generation using the following tools:
-DeepSeek[DeepSeek-v4]

This repository does not use AI in-line editing tools.
This repository does not use AI code review.

The preceding document was written with the assistance of DeepSeek[DeepSeek-v4].
