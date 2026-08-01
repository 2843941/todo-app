import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const testDbPath = path.join(process.cwd(), 'database', 'test.db');

function getTestDb() {
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
  
  const db = new Database(testDbPath);
  const schema = fs.readFileSync(path.join(process.cwd(), 'database', 'schema.sql'), 'utf-8');
  db.exec(schema);
  return db;
}

describe('Todo App Database Tests', () => {
  let db;
  
  before(() => {
    db = getTestDb();
  });
  
  after(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  
  it('should create a new task', () => {
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, topic, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run('Test Task', 'Test Description', '2026-12-31', 'Test Topic', 'Todo');
    
    assert.equal(result.changes, 1);
    
    const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = getStmt.get(result.lastInsertRowid);
    
    assert.equal(task.title, 'Test Task');
    assert.equal(task.status, 'Todo');
    assert.equal(task.archived, 0);
  });
  
  it('should edit an existing task', () => {
    const insertStmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, topic, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertResult = insertStmt.run('Original Title', 'Original Desc', '2026-12-31', 'Test', 'Todo');
    const taskId = insertResult.lastInsertRowid;
    
    const updateStmt = db.prepare(`
      UPDATE tasks SET title = ?, description = ?, due_date = ?, topic = ?, status = ?
      WHERE id = ?
    `);
    updateStmt.run('Updated Title', 'Updated Desc', '2026-11-30', 'Updated Topic', 'In-Progress', taskId);
    
    const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = getStmt.get(taskId);
    
    assert.equal(task.title, 'Updated Title');
    assert.equal(task.status, 'In-Progress');
  });
  
  it('should archive a task (soft delete)', () => {
    const insertStmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, topic, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const insertResult = insertStmt.run('To Archive', 'Will be archived', '2026-12-31', 'Test', 'Todo');
    const taskId = insertResult.lastInsertRowid;
    
    const archiveStmt = db.prepare('UPDATE tasks SET archived = 1 WHERE id = ?');
    archiveStmt.run(taskId);
    
    const getStmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    const task = getStmt.get(taskId);
    
    assert.equal(task.archived, 1);
    assert.equal(task.title, 'To Archive');
  });
  
  it('should flag overdue tasks correctly', () => {
    const insertStmt = db.prepare(`
      INSERT INTO tasks (title, description, due_date, topic, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertStmt.run('Overdue Task', 'This should be overdue', '2020-01-01', 'Test', 'Todo');
    
    const today = new Date().toISOString().split('T')[0];
    const stmt = db.prepare('SELECT * FROM tasks WHERE archived = 0');
    const tasks = stmt.all();
    
    const overdueTask = tasks.find(t => t.due_date === '2020-01-01');
    assert.ok(overdueTask, 'Overdue task should exist');
    assert.ok(overdueTask.due_date < today && overdueTask.status !== 'Complete', 
      'Task should be flagged as overdue');
  });
});