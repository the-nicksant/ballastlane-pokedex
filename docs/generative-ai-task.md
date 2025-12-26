# Generative AI Task

The following prompt is made for the creation of a Table component for a task management system as requested in the project requirments.

My approach for generating components and code implementations is following the **Plan and Execute** framework, specially working with Claude Code.

**Planning**
```
We are going to desing a Table Component for a task management system using React, @tanstack/react-table, react-query, zustand and ShadCn base components. The system must support full CRUD for tasks. Each task includes: id, title, description, status (todo, in-progress, done), and due_date. Tasks belong to a User (check the models)

Lets plan the implementation of this table component following the same best practices currently applied in out codebase.

- Detail de component structure
- Data fetching services required
- Authorization and Role access verification
```

**The output**
Claude example output was a multi-step plan fulfilling the requirements. 
(As the codebase doesn't exist, the Claude exemple code will be simpler, since it cannot read the codebase and current architecture)

```
Based on the current architecture, I recommend the following structure:

  1. TasksTable Component (src/components/tasks/TasksTable.tsx)

  - Main container component
  - Integrates @tanstack/react-table with column definitions
  - Connects to Zustand store for state management
  - Handles table configuration (pagination, sorting, filtering)
  - Renders ShadCn Table base components

  2. Column Definitions (src/components/tasks/columns.tsx)

  - Define columns for: id, title, description, status, due_date
  - Include custom cell renderers for:
    - Status badge with color coding (todo/in-progress/done)
    - Due date formatting and overdue highlighting
    - Action column with Edit/Delete buttons
  - Implement sortable headers
  - Add filtering capabilities per column

  3. Task Row Actions (src/components/tasks/TaskRowActions.tsx)

  - Dropdown menu component for row actions
  - Edit task (opens dialog/drawer)
  - Delete task (with confirmation)
  - Change status (quick action)
  - Role-based action visibility

  4. Task Dialogs (src/components/tasks/TaskDialog.tsx)

  - Create/Edit task form dialog
  - Form validation using react-hook-form + zod
  - Date picker for due_date
  - Status selector dropdown
  - User assignment (if multi-user)

  5. Zustand Store (src/stores/taskStore.ts)

  interface TaskStore {
    tasks: Task[]
    isLoading: boolean
    error: string | null

    // CRUD actions
    fetchTasks: () => Promise<void>
    createTask: (task: CreateTaskDto) => Promise<void>
    updateTask: (id: string, task: UpdateTaskDto) => Promise<void>
    deleteTask: (id: string) => Promise<void>

    // UI state
    selectedTask: Task | null
    setSelectedTask: (task: Task | null) => void

    // Filters
    filters: TaskFilters
    setFilters: (filters: TaskFilters) => void
  }

  API Services Required

  1. Task Service (src/services/api/tasks.ts)

  Endpoints:
  - GET /api/tasks - Fetch all tasks (with query params for filtering/sorting)
  - GET /api/tasks/:id - Fetch single task
  - POST /api/tasks - Create new task
  - PUT /api/tasks/:id - Update task
  - DELETE /api/tasks/:id - Delete task
  - PATCH /api/tasks/:id/status - Quick status update

  Query Parameters Support:
  - Pagination: page, limit
  - Sorting: sortBy, order
  - Filtering: status, userId, dueDateFrom, dueDateTo

  2. User Service Integration (src/services/api/users.ts)

  - GET /api/users - Fetch users for task assignment
  - Task ownership validation

  Authorization and Role Access Verification

  1. Permission Levels

  Assuming three roles: Admin, Manager, User

  Admin:
  - View all tasks
  - Create/Edit/Delete any task
  - Assign tasks to any user

  Manager:
  - View all tasks in their team
  - Create/Edit tasks for their team
  - Delete only tasks they created
  - Assign tasks to team members

  User:
  - View only their assigned tasks
  - Edit only their own tasks (title, description)
  - Cannot delete tasks
  - Cannot reassign tasks

  2. Implementation Approach

  Hook: useTaskPermissions.ts
  interface TaskPermissions {
    canView: (task: Task) => boolean
    canCreate: boolean
    canEdit: (task: Task) => boolean
    canDelete: (task: Task) => boolean
    canChangeStatus: (task: Task) => boolean
    canAssign: boolean
  }

  Authorization Service (src/services/auth/permissions.ts)
  - Centralized permission logic
  - Role-based access control (RBAC)
  - Integrates with current user context

  UI Implementation:
  - Conditionally render action buttons based on permissions
  - Disable edit mode in dialog if user lacks permission
  - Show read-only view for unauthorized actions
  - Display permission errors via toast notifications

  3. API-Level Security

  - Backend validates permissions on each request
  - Frontend checks are for UX only (not security)
  - Return 403 Forbidden for unauthorized actions
  - Filter tasks in API response based on user role

  Additional Considerations

  1. Optimistic Updates: Update Zustand store immediately, rollback on API failure
  2. Real-time Updates: Consider WebSocket/polling for multi-user scenarios
  3. Bulk Actions: Select multiple rows for status change/deletion
  4. Export Functionality: CSV/PDF export filtered tasks
  5. Accessibility: ARIA labels, keyboard navigation, screen reader support
  6. Error Handling: Graceful error states, retry mechanisms
  7. Loading States: Skeleton loaders during data fetch
  8. Empty States: Meaningful messages when no tasks exist
```

**Execution**
```
 The plan looks solid. Let's proceed with the implementation.

 Make sure to follow the project architecture guidelines and best practices.
 Lets use the plan steps as checkpoints. After the implementation of each checkpoint we will be revalidating the generated code and looking for bad implementations, potential security vulnerabilities and code smells.
```

**Notes**
The idea is using the Claude's generated plan to create an iteration loop were the LLM can focus on a more detailed, encapsulated task that has already been processed to avoid any implementation overhead.

Then, after the implementation, iterate over it to check for any mistakes, misinterpretations and hallucinations.

If the plan is for a big implementation like defining the initial project architecture or setting up the base technical project guidelines I usually ask the LLM to comeup with clarification questions after the initial planning.