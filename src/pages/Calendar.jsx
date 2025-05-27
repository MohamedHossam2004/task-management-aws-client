import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSpinner, FaChevronLeft, FaChevronRight, FaPlus, FaExclamationCircle, FaClock } from 'react-icons/fa';
import { getCookie } from '../utils/cookieUtils'; // Import getCookie
import { getTasks } from '../utils/apiUtils';

const API_BASE = 'https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com';

const Calendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

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
          return;
        }

        const response = await getTasks();
        setTasks(response.data);
      } catch (err) {
        console.error("Failed to fetch tasks for calendar:", err);
        setError(err.message || "Failed to load tasks");
        setTasks([]); // Clear tasks on error
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const getNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date &&
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear
      );
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const renderTaskIndicator = (task) => {
    const statusColors = {
      'completed': 'bg-green-500',
      'in-progress': 'bg-blue-500',
      'pending': 'bg-yellow-500'
    };

    return (
      <div
        key={task.taskId}
        className={`h-2 w-2 rounded-full ${statusColors[task.status] || 'bg-gray-500'} mr-1`}
      ></div>
    );
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month]} ${year}`;
  };

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} className="text-center text-gray-500 font-medium text-sm py-2">
        {day}
      </div>
    ));

    const days = [];
    // Fill in the blank days from the previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="border border-gray-200 p-2 h-32 bg-gray-50"></div>);
    }

    // Fill in the days of the current month
    for (let day = 1; day <= totalDays; day++) {
      const tasksForDay = getTasksForDate(day);
      const isCurrentDay = isToday(day);

      days.push(
        <div 
          key={day} 
          className={`border border-gray-200 p-2 h-32 hover:bg-gray-50 transition-colors overflow-hidden ${
            isCurrentDay ? 'bg-teal-50 border-teal-300' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={`text-sm font-semibold ${isCurrentDay ? 'text-teal-700 bg-teal-100 w-6 h-6 rounded-full flex items-center justify-center' : ''}`}>
              {day}
            </span>
            {tasksForDay.length > 0 && (
              <span className="text-xs text-gray-500">{tasksForDay.length} task{tasksForDay.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          
          <div className="space-y-1 overflow-hidden">
            {tasksForDay.slice(0, 3).map(task => (
              <div 
                key={task.taskId} 
                className={`text-xs p-1 rounded truncate ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}
                title={task.title}
              >
                {task.title}
              </div>
            ))}
            {tasksForDay.length > 3 && (
              <div className="text-xs text-gray-500 pl-1">
                + {tasksForDay.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Add days for the next month to complete the grid
    const totalCells = Math.ceil((totalDays + firstDay) / 7) * 7;
    for (let i = totalDays + firstDay; i < totalCells; i++) {
      days.push(<div key={`next-${i}`} className="border border-gray-200 p-2 h-32 bg-gray-50"></div>);
    }

    return (
      <>
        <div className="grid grid-cols-7 gap-px">{dayHeaders}</div>
        <div className="grid grid-cols-7 gap-px">{days}</div>
      </>
    );
  };

  const renderDailyTasks = () => {
    const today = new Date();
    const todayTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === today.getDate() &&
        taskDate.getMonth() === today.getMonth() &&
        taskDate.getFullYear() === today.getFullYear()
      );
    });

    const upcomingTasks = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const taskDate = new Date(task.due_date);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      return taskDate >= tomorrow && taskDate <= nextWeek;
    }).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    return (
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaClock className="text-teal-600 mr-2" /> Today's Tasks
          </h3>
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.taskId} className="flex items-center p-2 border-l-4 border-teal-500 bg-gray-50 rounded-r">
                  <div className={`h-3 w-3 rounded-full mr-3 ${
                    task.status === 'completed' 
                      ? 'bg-green-500' 
                      : task.status === 'in-progress'
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.priority} priority</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded">
              <p className="text-gray-500">No tasks scheduled for today</p>
              <button
                className="mt-2 px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                onClick={() => window.location.href = '/create'}
              >
                <FaPlus className="inline mr-1" /> Add Task
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FaExclamationCircle className="text-teal-600 mr-2" /> Upcoming Tasks
          </h3>
          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 5).map(task => {
                const dueDate = new Date(task.due_date);
                const today = new Date();
                const diffTime = Math.abs(dueDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={task.taskId} className="flex items-center p-2 border-l-4 border-blue-500 bg-gray-50 rounded-r">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Due in {diffDays} day{diffDays !== 1 ? 's' : ''} ({dueDate.toLocaleDateString()})
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : task.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                );
              })}
              {upcomingTasks.length > 5 && (
                <div className="text-center text-sm text-gray-500 pt-2 border-t">
                  + {upcomingTasks.length - 5} more upcoming tasks
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded">
              <p className="text-gray-500">No upcoming tasks for next week</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-teal-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center text-red-600">
          <FaExclamationCircle className="text-4xl mx-auto mb-4" />
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
          <FaCalendarAlt className="mr-3 text-teal-600" /> Task Calendar
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your tasks by due date
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={getPrevMonth}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <FaChevronLeft className="text-gray-700" />
          </button>
          
          <h2 className="text-xl font-semibold text-center text-gray-800">
            {formatMonthYear(currentMonth, currentYear)}
          </h2>
          
          <button
            onClick={getNextMonth}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <FaChevronRight className="text-gray-700" />
          </button>
        </div>
        
        {renderCalendar()}
      </div>
      
      {renderDailyTasks()}
    </div>
  );
};

export default Calendar;