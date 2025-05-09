import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaEye, FaEdit, FaClock, FaFlag, FaCheck, FaSpinner, FaHourglass, FaPlus } from 'react-icons/fa';

const API_BASE = 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/tasks`);
        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
        setTasks(tasks.filter(task => task.taskId !== id));
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheck className="text-green-500" />;
      case 'in-progress':
        return <FaSpinner className="text-blue-500" />;
      default:
        return <FaHourglass className="text-yellow-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]} border`}>
        <FaFlag className="mr-1 text-xs" /> {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Tasks</h2>
        <button 
          onClick={() => navigate('/create')}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow transition-colors"
        >
          <FaPlus className="mr-2" /> Add Task
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'all' ? 'bg-indigo-100 text-indigo-800 font-medium' : 'hover:bg-gray-100'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'pending' ? 'bg-yellow-100 text-yellow-800 font-medium' : 'hover:bg-gray-100'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'in-progress' ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-gray-100'}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${filter === 'completed' ? 'bg-green-100 text-green-800 font-medium' : 'hover:bg-gray-100'}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map(task => (
            <div key={task.taskId} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">{task.title}</h3>
                  <div className="flex items-center">
                    {getStatusIcon(task.status)}
                  </div>
                </div>
                
                <p className="text-gray-600 line-clamp-2 mb-4">{task.description || "No description provided"}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <FaClock className="mr-1" />
                  <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  {getPriorityBadge(task.priority)}
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/view/${task.taskId}`)}
                      className="p-2 rounded-full hover:bg-indigo-100 text-indigo-600 transition-colors"
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => navigate(`/update/${task.taskId}`)}
                      className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition-colors"
                      title="Edit task"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.taskId)}
                      className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <p className="text-gray-500 mb-4">No tasks found matching your criteria</p>
          <button 
            onClick={() => navigate('/create')}
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow transition-colors"
          >
            <FaPlus className="mr-2" /> Create your first task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;