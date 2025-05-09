import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaUser,
  FaFileAlt,
  FaCalendarAlt,
  FaFlag,
  FaTasks,
  FaUpload,
  FaExclamationCircle,
  FaSpinner,
  FaSave,
  FaArrowLeft,
  FaTrash
} from 'react-icons/fa';

const API_BASE = 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

const UpdateTask = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    file: null,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [originalFileName, setOriginalFileName] = useState('');
  const { taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tasks/${taskId}`);
        if (!res.ok) throw new Error('Failed to fetch task');
        const data = await res.json();
        
        // Format date to YYYY-MM-DD for input field
        if (data.due_date) {
          const date = new Date(data.due_date);
          data.due_date = date.toISOString().split('T')[0];
        }
        
        setForm(data);
        if (data.file_name) setOriginalFileName(data.file_name);
      } catch (error) {
        console.error("Error fetching task:", error);
        setError("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      const file = form.file;
      const fileData = file ? {
        name: file.name,
        type: file.type,
        content: await toBase64(file)
      } : undefined;

      // Create a copy of the form to avoid modifying the original
      const payload = { ...form };
      
      // Only include file data if there's a new file
      if (fileData) {
        payload.file = fileData;
      } else {
        // Don't send file property if no new file was uploaded
        delete payload.file;
      }

      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to update task');
      
      await res.json();
      navigate('/tasks');
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
  
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
        navigate('/tasks');
      } catch (error) {
        console.error("Failed to delete task:", error);
        setError("Failed to delete task");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/tasks')} 
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Back to Tasks
      </button>
      
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-indigo-500">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <FaTasks className="h-6 w-6 text-indigo-500" />
              <h2 className="text-2xl font-bold text-gray-800">Update Task</h2>
            </div>
            <button 
              onClick={handleDelete}
              className="flex items-center p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              <FaTrash className="mr-1" /> Delete
            </button>
          </div>
          <p className="text-gray-600 mb-6">Edit the task details below</p>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <FaExclamationCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaFileAlt className="h-4 w-4 text-gray-500" />
                Title
              </label>
              <input
                id="title"
                name="title"
                placeholder="Enter task title"
                value={form.title || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaFileAlt className="h-4 w-4 text-gray-500" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Enter task description"
                value={form.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="status" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaTasks className="h-4 w-4 text-gray-500" />
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status || 'pending'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <FaFlag className="h-4 w-4 text-gray-500" />
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={form.priority || 'medium'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="high" className="text-red-500 font-medium">
                    High
                  </option>
                  <option value="medium" className="text-amber-500 font-medium">
                    Medium
                  </option>
                  <option value="low" className="text-green-500 font-medium">
                    Low
                  </option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="due_date" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="h-4 w-4 text-gray-500" />
                Due Date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="file" className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaUpload className="h-4 w-4 text-gray-500" />
                Attachment {originalFileName && <span className="text-xs text-gray-500">(Current: {originalFileName})</span>}
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">{form.file ? form.file.name : "No new file selected"}</p>
                  </div>
                  <input id="file" name="file" type="file" className="hidden" onChange={handleChange} />
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50">
          <button
            className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
              submitting ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
            onClick={handleUpdate}
            disabled={submitting}
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Updating Task...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FaSave className="mr-2" /> Save Changes
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTask;