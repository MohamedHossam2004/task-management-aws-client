import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

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
    <Router>
      <div className="App">
        <h1 className="text-3xl font-bold">Task Manager</h1>
        <Routes>
          <Route path="/create" element={<CreateTask />} />
          <Route path="/update" element={<UpdateTask />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/view" element={<ViewTask />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
