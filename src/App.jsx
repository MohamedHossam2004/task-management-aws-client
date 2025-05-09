import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import CreateTask from './pages/CreateTask';
import UpdateTask from './pages/UpdateTask';
import TaskList from './pages/TaskList';
import ViewTask from './pages/ViewTask';
import { FaTasks, FaPlus, FaList, FaHome } from 'react-icons/fa';

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
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0 flex items-center">
                <FaTasks className="h-8 w-8 mr-2" />
                <span className="text-xl font-bold">Task Manager</span>
              </div>
              <div className="flex space-x-4">
                <Link to="/" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white transition-colors">
                  <FaHome className="mr-1" /> Home
                </Link>
                <Link to="/tasks" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white transition-colors">
                  <FaList className="mr-1" /> Tasks
                </Link>
                <Link to="/create" className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500 hover:text-white transition-colors">
                  <FaPlus className="mr-1" /> New Task
                </Link>
              </div>
            </div>
          </div>
        </nav>
        
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/tasks" replace />} />
                <Route path="/create" element={<CreateTask />} />
                <Route path="/update/:taskId" element={<UpdateTask />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/view/:taskId" element={<ViewTask />} />
              </Routes>
            </div>
          </div>
        </main>
        
        <footer className="bg-white shadow-inner mt-auto">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Task Management System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
