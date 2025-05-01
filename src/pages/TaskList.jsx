import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(`${API_BASE}/tasks`);
      const data = await res.json();
      setTasks(data);
    };
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    alert('Task deleted');
    setTasks(tasks.filter(task => task.taskId !== id));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">All Tasks</h2>
      <ul className="list-disc pl-5">
        {tasks.map(task => (
          <li key={task.taskId} className="mb-2">
            <strong>{task.title}</strong> - {task.status}
            <button onClick={() => handleDelete(task.taskId)} className="bg-red-500 text-white p-1 ml-2 rounded">Delete</button>
            <button onClick={() => navigate(`/view/${task.taskId}`)} className="bg-green-500 text-white p-1 ml-2 rounded">View</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;