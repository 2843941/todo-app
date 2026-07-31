import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

// PUT /api/tasks/[id] - Edit an existing task
export async function PUT(request, { params }) {
  try {
    // IMPORTANT: params is a Promise, we need to await it
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    const body = await request.json();
    const { title, description, due_date, topic, status } = body;

    // Validate required fields
    if (!title || !due_date || !topic || !status) {
      return NextResponse.json(
        { error: 'Title, due date, topic, and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['Todo', 'In-Progress', 'Complete'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status must be Todo, In-Progress, or Complete' },
        { status: 400 }
      );
    }

    // Check if task exists
    const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const existingTask = checkStmt.get(id);
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update the task
    const stmt = db.prepare(`
      UPDATE tasks 
      SET title = ?, description = ?, due_date = ?, topic = ?, status = ?
      WHERE id = ?
    `);
    stmt.run(title, description || null, due_date, topic, status, id);

    // Fetch the updated task
    const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const updatedTask = getStmt.get(id);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Archive a task
export async function PATCH(request, { params }) {
  try {
    // IMPORTANT: params is a Promise, we need to await it
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    // Check if task exists
    const checkStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const existingTask = checkStmt.get(id);
    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Archive the task (set archived = 1)
    const stmt = db.prepare('UPDATE tasks SET archived = 1 WHERE id = ?');
    stmt.run(id);

    // Fetch the archived task
    const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const archivedTask = getStmt.get(id);

    return NextResponse.json(archivedTask);
  } catch (error) {
    console.error('Error archiving task:', error);
    return NextResponse.json({ error: 'Failed to archive task' }, { status: 500 });
  }
}