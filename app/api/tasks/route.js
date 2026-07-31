import { NextResponse } from 'next/server';
import db from '../../../lib/db';

// GET /api/tasks - Fetch all tasks with sorting
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sortBy = searchParams.get('sortBy') || 'due_date';
    const status = searchParams.get('status');
    const archived = searchParams.get('archived') === 'true';

    let query = 'SELECT * FROM tasks WHERE archived = ?';
    const params = [archived ? 1 : 0];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    // Add sorting
    const validSortFields = ['topic', 'status', 'due_date'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'due_date';
    query += ` ORDER BY ${sortField} COLLATE NOCASE ASC`;

    const stmt = db.prepare(query);
    const tasks = stmt.all(...params);

    // Add overdue flag to each task
    const today = new Date().toISOString().split('T')[0];
    const tasksWithOverdue = tasks.map((task) => ({
      ...task,
      overdue: task.due_date < today && task.status !== 'Complete'
    }));

    return NextResponse.json(tasksWithOverdue);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request) {
  try {
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

    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, topic, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(title, description || null, due_date, topic, status);
    
    // Fetch the created task
    const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const newTask = getStmt.get(result.lastInsertRowid);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}