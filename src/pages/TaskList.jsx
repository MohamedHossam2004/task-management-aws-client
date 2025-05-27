import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTrash,
  FaEye,
  FaEdit,
  FaClock,
  FaFlag,
  FaCheck,
  FaSpinner,
  FaHourglass,
  FaPlus,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaTasks,
} from "react-icons/fa";
import { getCookie } from "../utils/cookieUtils";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getCookie("access_token");

        if (!token) {
          setError("Authentication required. Please sign in.");
          setLoading(false);
          return;
        }

        const response = await getTasks();
        setTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setError(error.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const token = getCookie("access_token");

        if (!token) {
          setError("Authentication required. Please sign in.");
          return;
        }

        await deleteTask(id);

        setTasks(tasks.filter((task) => task.taskId !== id));
      } catch (error) {
        console.error("Failed to delete task:", error);
        setError(error.message || "Failed to delete task");
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheck className="text-green-500" />;
      case "in-progress":
        return <FaSpinner className="text-blue-500 animate-spin" />;
      default:
        return <FaHourglass className="text-yellow-500 animate-pulse" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: "bg-gradient-to-r from-red-500 to-red-600 text-white",
      medium: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white",
      low: "bg-gradient-to-r from-green-400 to-green-500 text-white",
    };

    const icons = {
      high: <FaExclamationTriangle className="mr-1 text-xs" />,
      medium: <FaFlag className="mr-1 text-xs" />,
      low: <FaCheck className="mr-1 text-xs" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colors[priority]} shadow-sm`}
      >
        {icons[priority]} {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // Apply multiple filters
  const filteredTasks = tasks
    .filter((task) => filter === "all" || task.status === filter)
    .filter(
      (task) => priorityFilter === "all" || task.priority === priorityFilter,
    )
    .filter(
      (task) =>
        searchTerm === "" ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-2 rounded-lg mr-3 shadow-lg">
              <FaTasks className="h-6 w-6" />
            </div>
            My Tasks
          </h2>
          <p className="text-gray-500 mt-1">Manage your tasks efficiently</p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="flex items-center bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-5 py-2 rounded-md shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 w-full md:w-auto justify-center"
          disabled={!getCookie("access_token")}
        >
          <FaPlus className="mr-2" /> Add New Task
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
            >
              <FaFilter className="mr-2 text-teal-500" /> Filters{" "}
              {showFilters ? "▲" : "▼"}
            </button>

            <button
              onClick={() => navigate("/create")}
              className="flex items-center bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-md shadow transition-all hover:shadow-lg md:hidden"
            >
              <FaPlus className="mr-2" /> Add
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex flex-wrap space-x-2">
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${filter === "all" ? "bg-teal-100 text-teal-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${filter === "pending" ? "bg-yellow-100 text-yellow-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setFilter("pending")}
                >
                  Pending
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${filter === "in-progress" ? "bg-blue-100 text-blue-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setFilter("in-progress")}
                >
                  In Progress
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${filter === "completed" ? "bg-green-100 text-green-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setFilter("completed")}
                >
                  Completed
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <div className="flex flex-wrap space-x-2">
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${priorityFilter === "all" ? "bg-teal-100 text-teal-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setPriorityFilter("all")}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${priorityFilter === "high" ? "bg-red-100 text-red-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setPriorityFilter("high")}
                >
                  High
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${priorityFilter === "medium" ? "bg-yellow-100 text-yellow-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setPriorityFilter("medium")}
                >
                  Medium
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md transition-colors ${priorityFilter === "low" ? "bg-green-100 text-green-800 font-medium" : "hover:bg-gray-100"}`}
                  onClick={() => setPriorityFilter("low")}
                >
                  Low
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <FaSpinner className="animate-spin text-teal-600 text-4xl mx-auto mb-4" />
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.taskId}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border-l-4 border-teal-500 overflow-hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 truncate">
                    {task.title}
                  </h3>
                  <div className="flex items-center justify-center rounded-full bg-gray-100 p-2 h-8 w-8">
                    {getStatusIcon(task.status)}
                  </div>
                </div>

                <p className="text-gray-600 line-clamp-2 mb-4 bg-gray-50 p-2 rounded-md">
                  {task.description || "No description provided"}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4 bg-blue-50 rounded-md p-2">
                  <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>
                  <span>
                    {task.due_date
                      ? new Date(task.due_date).toLocaleDateString()
                      : "No due date"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    <div className="mr-2">
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    <button
                      onClick={() => navigate(`/view/${task.taskId}`)}
                      className="p-2 rounded-full bg-teal-100 hover:bg-teal-200 text-teal-600 transition-colors shadow-sm"
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => navigate(`/update/${task.taskId}`)}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors shadow-sm"
                      title="Edit task"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(task.taskId)}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors shadow-sm"
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
        <div className="bg-white rounded-lg shadow-lg p-10 text-center border border-dashed border-gray-300">
          <div className="bg-teal-100 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
            <FaTasks className="text-3xl text-teal-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No tasks found
          </h3>
          <p className="text-gray-500 mb-6">
            No tasks match your current filter criteria
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => {
                setFilter("all");
                setPriorityFilter("all");
                setSearchTerm("");
              }}
              className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow transition-colors"
            >
              <FaFilter className="mr-2" /> Clear filters
            </button>
            <button
              onClick={() => navigate("/create")}
              className="inline-flex items-center justify-center bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-4 py-2 rounded-md shadow-md transition-all hover:shadow-lg"
            >
              <FaPlus className="mr-2" /> Create your first task
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
