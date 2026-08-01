'use client';

import { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [sortBy, setSortBy] = useState('due_date');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const url = `/api/tasks?sortBy=${sortBy}&status=${statusFilter}&archived=${showArchived}`;
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [sortBy, statusFilter, showArchived]);

  // Create a new task
  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating task:', error);
      return false;
    }
  };

  // Edit a task
  const editTask = async (id, taskData) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
      if (response.ok) {
        fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error editing task:', error);
      return false;
    }
  };

  // Archive a task
  const archiveTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        fetchTasks();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error archiving task:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Todo Application</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Create task form */}
          <div className="lg:col-span-1">
            <TaskForm onSubmit={createTask} />
          </div>

          {/* Right column: Task list */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Filters and sorting */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort by
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="due_date">Due Date</option>
                    <option value="topic">Topic</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="Todo">Todo</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showArchived}
                      onChange={(e) => setShowArchived(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Show archived</span>
                  </label>
                </div>
              </div>

              {/* Task list */}
              {loading ? (
                <p className="text-gray-500">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No tasks found. Create your first task!
                </p>
              ) : (
                <TaskList
                  tasks={tasks}
                  onEdit={editTask}
                  onArchive={archiveTask}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}