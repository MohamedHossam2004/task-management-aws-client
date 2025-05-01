import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateTask = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    file: null,
  });
  const { taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`);
      const data = await res.json();
      setForm(data);
    };
    fetchTask();
  }, [taskId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleUpdate = async () => {
    const file = form.file;
    const fileData = file ? {
      name: file.name,
      type: file.type,
      content: await toBase64(file)
    } : undefined;

    const payload = { ...form, file: fileData };

    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert('Task updated');
    navigate('/tasks');
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Update Task</h2>
      <input name="title" value={form.title} placeholder="Title" onChange={handleChange} className="border p-2 mb-2 w-full" />
      <textarea name="description" value={form.description} placeholder="Description" onChange={handleChange} className="border p-2 mb-2 w-full"></textarea>
      <select name="status" value={form.status} onChange={handleChange} className="border p-2 mb-2 w-full">
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select name="priority" value={form.priority} onChange={handleChange} className="border p-2 mb-2 w-full">
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="border p-2 mb-2 w-full" />
      <input type="file" name="file" onChange={handleChange} className="border p-2 mb-2 w-full" />

      <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded">Update Task</button>
    </div>
  );
};

export default UpdateTask;