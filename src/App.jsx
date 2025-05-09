import { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import CreateTask from "./pages/CreateTask";
import UpdateTask from "./pages/UpdateTask";
import TaskList from "./pages/TaskList";
import ViewTask from "./pages/ViewTask";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import UserProfile from "./pages/UserProfile";
import {
  FaTasks,
  FaPlus,
  FaList,
  FaHome,
  FaUser,
  FaCog,
  FaCalendarAlt,
  FaChartBar,
  FaCheck,
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
} from "react-icons/fa";

const API_BASE = "https://jw1gmhmdjj.execute-api.us-east-1.amazonaws.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    userId: "",
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
    file: null,
  });
  const [taskIdToUpdate, setTaskIdToUpdate] = useState("");
  const [taskIdToView, setTaskIdToView] = useState("");
  const [viewedTask, setViewedTask] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetch(`${API_BASE}/tasks`)
      .then((res) => res.json())
      .then(setTasks)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleCreate = async () => {
    const file = form.file;
    const fileData = file
      ? {
          name: file.name,
          type: file.type,
          content: await toBase64(file),
        }
      : undefined;

    const payload = { ...form, file: fileData };

    const res = await fetch(`${API_BASE}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    alert("Task created");
    setTasks([...tasks, data.task]);
  };

  const handleUpdate = async () => {
    const payload = { ...form };
    delete payload.userId; // we don't need to update userId
    if (form.file) {
      payload.file = {
        name: form.file.name,
        type: form.file.type,
        content: await toBase64(form.file),
      };
    }

    const res = await fetch(`${API_BASE}/tasks/${taskIdToUpdate}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    alert("Task updated");
  };

  const handleDelete = async (id) => {
    await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
    alert("Task deleted");
    setTasks(tasks.filter((task) => task.taskId !== id));
  };

  const handleView = async () => {
    const res = await fetch(`${API_BASE}/tasks/${taskIdToView}`);
    const data = await res.json();
    setViewedTask(data);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
    
  const handleLogin = () => {
    // Redirect to Cognito login page
    window.location.href = "https://your-cognito-domain.auth.region.amazoncognito.com/login?client_id=your-client-id&response_type=code&redirect_uri=your-redirect-uri";
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserInfo({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
    // Redirect to Cognito logout page
    window.location.href = "https://your-cognito-domain.auth.region.amazoncognito.com/logout?client_id=your-client-id&logout_uri=your-logout-uri";
  };

  return (
    <Router>
      <AppLayout 
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route path="/create" element={<CreateTask />} />
          <Route path="/update/:taskId" element={<UpdateTask />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/view/:taskId" element={<ViewTask />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

function AppLayout({ isAuthenticated, handleLogin, handleLogout, children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar 
        isAuthenticated={isAuthenticated}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <main className="w-full py-6 px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="py-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {children}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

function NavBar({ isAuthenticated, handleLogin, handleLogout, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <nav className="bg-gradient-to-r from-teal-800 to-blue-800 text-white shadow-lg">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-white p-2 rounded-lg mr-3">
              <FaTasks className="h-8 w-8 text-teal-800" />
            </div>
            <span className="text-xl font-bold">Task Manager</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            <NavLinks />
          </div>
          
          <div className="flex items-center space-x-4">
            <NavLink 
              to="/profile" 
              className="p-2 rounded-md focus:outline-none"
              activeClassName="bg-white text-teal-800"
              inactiveClassName="text-white bg-white bg-opacity-20 hover:bg-white hover:text-teal-700"
              title="User Profile"
            >
              <FaCog className="h-5 w-5" />
            </NavLink>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="bg-white p-1 rounded-full">
                  <FaUser className="h-6 w-6 text-teal-800" />
                </div>
                <button 
                  onClick={handleLogout} 
                  className="hidden sm:flex text-white hover:bg-white hover:text-red-700 focus:outline-none items-center text-xs bg-red-500 bg-opacity-30 px-2 py-1 rounded"
                  title="Sign out"
                >
                  <FaSignOutAlt className="h-4 w-4 mr-1" /> Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin} 
                className="hidden sm:flex text-white hover:bg-white hover:text-green-700 focus:outline-none items-center text-xs bg-green-500 bg-opacity-30 px-2 py-1 rounded"
                title="Sign in"
              >
                <FaSignInAlt className="h-4 w-4 mr-1" /> Sign In
              </button>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-white bg-white bg-opacity-20 hover:bg-white hover:text-teal-700 focus:outline-none"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-teal-900 mt-2 py-3 px-2 rounded-md shadow-lg">
            <div className="space-y-1">
              <MobileNavLinks setMobileMenuOpen={setMobileMenuOpen} />
              
              {isAuthenticated ? (
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex w-full items-center px-3 py-2 rounded-md text-white bg-red-700 hover:bg-white hover:text-red-700 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </button>
              ) : (
                <button 
                  onClick={() => { handleLogin(); setMobileMenuOpen(false); }}
                  className="flex w-full items-center px-3 py-2 rounded-md text-white bg-green-700 hover:bg-white hover:text-green-700 transition-colors"
                >
                  <FaSignInAlt className="mr-2" /> Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLinks() {
  return (
    <>
      <NavLink to="/tasks">
        <FaList className="mr-2" /> Tasks
      </NavLink>
      <NavLink to="/create">
        <FaPlus className="mr-2" /> New Task
      </NavLink>
      <NavLink to="/calendar">
        <FaCalendarAlt className="mr-2" /> Calendar
      </NavLink>
      <NavLink to="/analytics">
        <FaChartBar className="mr-2" /> Analytics
      </NavLink>
    </>
  );
}

function MobileNavLinks({ setMobileMenuOpen }) {
  return (
    <>
      <MobileNavLink to="/tasks" setMobileMenuOpen={setMobileMenuOpen}>
        <FaList className="mr-2" /> Tasks
      </MobileNavLink>
      <MobileNavLink to="/create" setMobileMenuOpen={setMobileMenuOpen}>
        <FaPlus className="mr-2" /> New Task
      </MobileNavLink>
      <MobileNavLink to="/calendar" setMobileMenuOpen={setMobileMenuOpen}>
        <FaCalendarAlt className="mr-2" /> Calendar
      </MobileNavLink>
      <MobileNavLink to="/analytics" setMobileMenuOpen={setMobileMenuOpen}>
        <FaChartBar className="mr-2" /> Analytics
      </MobileNavLink>
      <MobileNavLink to="/profile" setMobileMenuOpen={setMobileMenuOpen}>
        <FaUser className="mr-2" /> Profile
      </MobileNavLink>
    </>
  );
}

function NavLink({ to, children, exact, className, activeClassName, inactiveClassName }) {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  
  const baseClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const defaultActiveClasses = "bg-white text-teal-800 font-bold";
  const defaultInactiveClasses = "bg-white bg-opacity-20 text-white hover:bg-white hover:text-teal-700";
  
  const finalActiveClasses = activeClassName || defaultActiveClasses;
  const finalInactiveClasses = inactiveClassName || defaultInactiveClasses;
  
  return (
    <Link
      to={to}
      className={`${baseClasses} ${isActive ? finalActiveClasses : finalInactiveClasses} ${className || ""}`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, exact, setMobileMenuOpen }) {
  const location = useLocation();
  const isActive = exact ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-white text-teal-800 font-bold' 
          : 'text-white bg-teal-800 hover:bg-white hover:text-teal-800'
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );
}

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-teal-900 text-white shadow-inner">
      <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaTasks className="mr-2" /> Task Manager
            </h3>
            <p className="text-gray-300 text-sm">
              A powerful task management system to organize your work and
              increase productivity.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-300 text-sm">

              <li>
                <Link
                  to="/tasks"
                  className="hover:text-white transition-colors"
                >
                  Tasks
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="hover:text-white transition-colors"
                >
                  Create Task
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li className="flex items-center">
                <FaCheck className="text-green-400 mr-2" /> Task Management
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-400 mr-2" /> Priority Setting
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-400 mr-2" /> Due Date
                Tracking
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-400 mr-2" /> Status Updates
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaClock className="mr-2" /> Working Hours
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Monday - Friday: 9:00 AM - 5:00 PM
              <br />
              Saturday - Sunday: Closed
            </p>
            <p className="text-center text-sm text-gray-400">
              © {new Date().getFullYear()} Task Management System. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default App;