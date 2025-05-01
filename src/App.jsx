import { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    userId: '',
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    file: null,
  });
  const [taskIdToUpdate, setTaskIdToUpdate] = useState('');
  const [taskIdToView, setTaskIdToView] = useState('');
  const [viewedTask, setViewedTask] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/tasks`)
      .then(res => res.json())
      .then(setTasks)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleCreate = async () => {
    const file = form.file;
    const fileData = file ? {
      name: file.name,
      type: file.type,
      content: await toBase64(file)
    } : undefined;

    const payload = { ...form, file: fileData };

    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert('Task created');
    setTasks([...tasks, data.task]);
  };

  const handleUpdate = async () => {
    const payload = { ...form };
    delete payload.userId; // we don't need to update userId
    if (form.file) {
      payload.file = {
        name: form.file.name,
        type: form.file.type,
        content: await toBase64(form.file)
      };
    }

    const res = await fetch(`${API_BASE}/tasks/${taskIdToUpdate}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert('Task updated');
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    alert('Task deleted');
    setTasks(tasks.filter(task => task.taskId !== id));
  };

  const handleView = async () => {
    const res = await fetch(`${API_BASE}/tasks/${taskIdToView}`);
    const data = await res.json();
    setViewedTask(data);
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  return (
    <div className="App">
      <h1>Task Manager</h1>

      <h2>Create or Update Task</h2>
      <input name="userId" placeholder="User ID" onChange={handleChange} />
      <input name="title" placeholder="Title" onChange={handleChange} />
      <textarea name="description" placeholder="Description" onChange={handleChange}></textarea>
      <select name="status" onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
      <select name="priority" onChange={handleChange}>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <input type="date" name="due_date" onChange={handleChange} />
      <input type="file" name="file" onChange={handleChange} />

      <button onClick={handleCreate}>Create Task</button>
      <input placeholder="Task ID to Update" onChange={e => setTaskIdToUpdate(e.target.value)} />
      <button onClick={handleUpdate}>Update Task</button>

      <h2>All Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.taskId}>
            <strong>{task.title}</strong> - {task.status}
            <button onClick={() => handleDelete(task.taskId)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2>View Task by ID</h2>
      <input placeholder="Task ID" onChange={e => setTaskIdToView(e.target.value)} />
      <button onClick={handleView}>View Task</button>
      {viewedTask && (
        <div>
          <h3>{viewedTask.title}</h3>
          <p>{viewedTask.description}</p>
          <p>Status: {viewedTask.status}</p>
          <p>Priority: {viewedTask.priority}</p>
          {viewedTask.file_url && <a href={viewedTask.file_url} target="_blank">View File</a>}
        </div>
      )}
    </div>
  );
}

export default App;
