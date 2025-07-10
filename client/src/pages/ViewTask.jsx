import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookieUtils'; // Import getCookie
import { 
  FaUser, 
  FaCalendarAlt, 
  FaFlag, 
  FaClock, 
  FaCheck, 
  FaSpinner, 
  FaHourglass,
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaFileAlt,
  FaDownload
} from 'react-icons/fa';

const API_BASE = 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

const ViewTask = () => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { taskId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const token = getCookie('access_token');
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/tasks/${taskId}`, { headers });
        
        if (!res.ok) {
          // Handle non-OK responses (e.g., 401, 403, 404)
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          console.error("Failed to fetch task, status:", res.status, "Error:", errorData);
          // Optionally, set an error state to display to the user
          setTask(null); // Clear task data if fetch fails
          throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setTask(data);
      } catch (error) {
        console.error("Failed to fetch task:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        // It might be good to set a submitting/loading state here if you have one
        // e.g., setDeleting(true); setError(null);
        const token = getCookie('access_token');
        const headers = {};

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          // Handle missing token, e.g., show error or redirect to login
          console.error("Authentication token not found for delete operation.");
          // setError("Authentication required to delete task."); // If you have an error state
          return;
        }

        const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: headers,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          throw new Error(errorData.message || `Failed to delete task: ${res.status}`);
        }
        
        // If successful, navigate away
        navigate('/tasks');
      } catch (error) {
        console.error("Failed to delete task:", error);
        // setError(error.message || "An error occurred while deleting the task."); // If you have an error state
      } finally {
        // e.g., setDeleting(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    const icons = {
      completed: <FaCheck className="mr-1" />,
      'in-progress': <FaSpinner className="mr-1" />,
      pending: <FaHourglass className="mr-1" />
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status]} border`}>
        {icons[status]} {status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[priority]} border`}>
        <FaFlag className="mr-1" /> {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-4">
      <button 
        onClick={() => navigate('/tasks')} 
        className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors"
      >
        <FaArrowLeft className="mr-2" /> Back to Tasks
      </button>
      
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
        </div>
      ) : task ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{task.title}</h2>
              <div className="flex space-x-3">
                <button 
                  onClick={() => navigate(`/update/${taskId}`)}
                  className="flex items-center p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <FaEdit className="mr-1" /> Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex items-center p-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {getStatusBadge(task.status)}
              {getPriorityBadge(task.priority)}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-line">{task.description || "No description provided."}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-start">
                <FaUser className="text-gray-400 mt-1 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Assigned to</h4>
                  <p className="text-gray-700">{task.userId || "Unassigned"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaCalendarAlt className="text-gray-400 mt-1 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                  <p className="text-gray-700">{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-gray-400 mt-1 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                  <p className="text-gray-700">{task.created_at ? new Date(task.created_at).toLocaleString() : "Unknown"}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaClock className="text-gray-400 mt-1 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Updated At</h4>
                  <p className="text-gray-700">{task.updated_at ? new Date(task.updated_at).toLocaleString() : "Not updated"}</p>
                </div>
              </div>
            </div>
            
            {task.file_url && (
              <div className="border border-gray-200 rounded-md p-4">
                <div className="flex items-center">
                  <FaFileAlt className="text-indigo-400 mr-2 text-xl" />
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-500">Attachment</h4>
                    <p className="text-gray-700 truncate">{task.file_name || "File"}</p>
                  </div>
                  <a 
                    href={task.signed_file_url || task.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    <FaDownload className="mr-1" /> Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <p className="text-red-500">Task not found</p>
          <button 
            onClick={() => navigate('/tasks')} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go back to task list
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewTask;