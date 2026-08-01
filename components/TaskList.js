'use client';

import { useState } from 'react';

export default function TaskList({ tasks, onEdit, onArchive }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date,
      topic: task.topic,
      status: task.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditSubmit = async (id) => {
    if (!editData.title || !editData.due_date || !editData.topic || !editData.status) {
      alert('Title, due date, topic, and status are required');
      return;
    }

    setIsSubmitting(true);
    const success = await onEdit(id, editData);
    setIsSubmitting(false);

    if (success) {
      setEditingId(null);
      setEditData({});
    } else {
      alert('Failed to update task. Please try again.');
    }
  };

  const handleArchive = async (id, title) => {
    if (confirm(`Archive task "${title}"?`)) {
      const success = await onArchive(id);
      if (!success) {
        alert('Failed to archive task. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Todo':
        return 'bg-gray-200 text-gray-800';
      case 'In-Progress':
        return 'bg-yellow-200 text-yellow-800';
      case 'Complete':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`border rounded-lg p-4 ${
            task.overdue ? 'border-red-400 bg-red-50' : 'border-gray-200'
          }`}
        >
          {editingId === task.id ? (
            // Edit mode
            <div className="space-y-3">
              <input
                type="text"
                value={editData.title || ''}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Title"
              />
              <textarea
                value={editData.description || ''}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Description"
                rows={2}
              />
              <input
                type="date"
                value={editData.due_date || ''}
                onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={editData.topic || ''}
                onChange={(e) => setEditData({ ...editData, topic: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Topic"
              />
              <select
                value={editData.status || 'Todo'}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="Todo">Todo</option>
                <option value="In-Progress">In-Progress</option>
                <option value="Complete">Complete</option>
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditSubmit(task.id)}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View mode
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {task.title}
                    {task.overdue && (
                      <span className="ml-2 text-red-600 text-sm font-medium">
                         OVERDUE
                      </span>
                    )}
                  </h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    <span className="text-gray-600"> {task.due_date}</span>
                    <span className="text-gray-600"> {task.topic}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {task.archived === 1 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-400 text-white">
                        Archived
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(task)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {task.archived === 0 && (
                    <button
                      onClick={() => handleArchive(task.id, task.title)}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                      Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}