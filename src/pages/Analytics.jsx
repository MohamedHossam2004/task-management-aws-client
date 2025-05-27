import React, { useState, useEffect } from 'react';
import { FaChartBar, FaCalendarAlt, FaCheckCircle, FaHourglass, FaSpinner, FaClock, FaExclamationTriangle, FaFlag } from 'react-icons/fa';
import { getCookie } from '../utils/cookieUtils'; // Import getCookie
import { getTasks } from '../utils/apiUtils';

const API_BASE = 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
    overdue: 0,
    dueToday: 0,
    dueSoon: 0 // next 3 days
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const token = getCookie('access_token');
        const headers = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          setError("Authentication required. Please sign in.");
          setLoading(false);
          setTasks([]); // Clear tasks if not authenticated
          setStats({ // Reset stats
            total: 0, completed: 0, inProgress: 0, pending: 0,
            highPriority: 0, mediumPriority: 0, lowPriority: 0,
            overdue: 0, dueToday: 0, dueSoon: 0
          });
          return;
        }

        const response = await getTasks();
        const data = response.data;
        setTasks(data);
        
        // Calculate statistics
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const inThreeDays = new Date(today);
        inThreeDays.setDate(today.getDate() + 3);
        
        const newStats = {
          total: data.length,
          completed: data.filter(task => task.status === 'completed').length,
          inProgress: data.filter(task => task.status === 'in-progress').length,
          pending: data.filter(task => task.status === 'pending').length,
          highPriority: data.filter(task => task.priority === 'high').length,
          mediumPriority: data.filter(task => task.priority === 'medium').length,
          lowPriority: data.filter(task => task.priority === 'low').length,
          overdue: data.filter(task => {
            if (!task.due_date || task.status === 'completed') return false;
            const dueDate = new Date(task.due_date);
            return dueDate < today;
          }).length,
          dueToday: data.filter(task => {
            if (!task.due_date || task.status === 'completed') return false;
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate.getTime() === today.getTime();
          }).length,
          dueSoon: data.filter(task => {
            if (!task.due_date || task.status === 'completed') return false;
            const dueDate = new Date(task.due_date);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate > today && dueDate <= inThreeDays;
          }).length
        };
        
        setStats(newStats);
      } catch (err) {
        console.error("Failed to fetch tasks for analytics:", err);
        setError(err.message || "Failed to load tasks");
        setTasks([]); // Clear tasks on error
        setStats({ // Reset stats on error
          total: 0, completed: 0, inProgress: 0, pending: 0,
          highPriority: 0, mediumPriority: 0, lowPriority: 0,
          overdue: 0, dueToday: 0, dueSoon: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const calculateCompletionRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const calculateProgressRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.inProgress / stats.total) * 100);
  };

  // Helper function to get color for progress bars
  const getColorClass = (rate) => {
    if (rate >= 75) return 'bg-green-500';
    if (rate >= 50) return 'bg-teal-500';
    if (rate >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-teal-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center text-red-600">
          <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaChartBar className="mr-3 text-teal-600" /> Task Analytics
        </h1>
        <p className="text-gray-600 mt-2">
          An overview of your task management activities and productivity metrics.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-teal-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <FaChartBar className="text-teal-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheckCircle className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaSpinner className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaHourglass className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Completion Rate</h2>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-teal-100 text-teal-800">
                  {calculateCompletionRate()}% Complete
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-teal-800">
                  {stats.completed}/{stats.total}
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
              <div style={{ width: `${calculateCompletionRate()}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getColorClass(calculateCompletionRate())}`}></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {calculateCompletionRate() < 50 
              ? "You're making progress! Keep going to increase your completion rate."
              : "Great job! You're maintaining a good task completion rate."}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress Overview</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="bg-red-100 w-10 h-10 flex items-center justify-center rounded-full mx-auto mb-2">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Overdue</p>
              <p className="text-lg font-bold text-gray-800">{stats.overdue}</p>
            </div>
            
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="bg-yellow-100 w-10 h-10 flex items-center justify-center rounded-full mx-auto mb-2">
                <FaClock className="text-yellow-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Due Today</p>
              <p className="text-lg font-bold text-gray-800">{stats.dueToday}</p>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full mx-auto mb-2">
                <FaCalendarAlt className="text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-600">Due Soon</p>
              <p className="text-lg font-bold text-gray-800">{stats.dueSoon}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 border rounded-lg">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FaFlag className="text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">High Priority</p>
              <p className="text-xl font-bold text-gray-800">{stats.highPriority}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800">
                {stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FaFlag className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Medium Priority</p>
              <p className="text-xl font-bold text-gray-800">{stats.mediumPriority}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                {stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center p-4 border rounded-lg">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaFlag className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Low Priority</p>
              <p className="text-xl font-bold text-gray-800">{stats.lowPriority}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
                {stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Insights</h2>
        <div className="space-y-4">
          {stats.overdue > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-start">
              <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">You have {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}</p>
                <p className="text-sm text-red-700 mt-1">Consider addressing these tasks first to improve your productivity.</p>
              </div>
            </div>
          )}
          
          {stats.highPriority > stats.completed && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex items-start">
              <FaFlag className="text-yellow-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">Focus on high-priority tasks</p>
                <p className="text-sm text-yellow-700 mt-1">You have {stats.highPriority} high-priority tasks that need attention.</p>
              </div>
            </div>
          )}
          
          {stats.completed > 0 && stats.completed >= stats.total * 0.7 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-start">
              <FaCheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Great progress!</p>
                <p className="text-sm text-green-700 mt-1">You've completed {stats.completed} out of {stats.total} tasks ({calculateCompletionRate()}%).</p>
              </div>
            </div>
          )}
          
          {stats.total === 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
              <FaCalendarAlt className="text-blue-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Get started</p>
                <p className="text-sm text-blue-700 mt-1">You don't have any tasks yet. Create a new task to begin tracking your productivity.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;