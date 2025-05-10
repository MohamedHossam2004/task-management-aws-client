import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaSignOutAlt, FaUserEdit, FaSpinner, FaExclamationCircle } from 'react-icons/fa';
// Assuming cookie utils are here
import { useNavigate } from 'react-router-dom'; // For redirecting
import { removeCookie, getCookie } from '../utils/cookieUtils'; // Import removeCookie and getCookie
import { cognitoConfig } from '../config/auth'; // Import cognitoConfig

const API_BASE = import.meta.env.VITE_API_BASE_URL; // Assuming API_BASE is in .env

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '', // RDS uses lowercase
    lastname: '',  // RDS uses lowercase
    email: '',
    phonenumber: '', // RDS uses lowercase
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      const token = getCookie('access_token');

      if (!token) {
        setError('You are not logged in. Please sign in to view your profile.');
        setLoading(false);
        setUser(null); // Ensure user state is cleared
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
          throw new Error(errorData.message || `Failed to fetch profile: ${response.statusText}`);
        }

        const data = await response.json();
        setUser(data);
        // Initialize formData with fetched data (use lowercase keys from RDS)
        setFormData({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email || '',
          phonenumber: data.phonenumber || '',
        });
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError(err.message || 'Failed to load profile.');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would normally send the data to your backend
    // For now, just updating local state as an example
    setUser(prevUser => ({
      ...prevUser, // Keep existing cognito_sub, createdat, updatedat etc.
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      phonenumber: formData.phonenumber,
    }));
    setIsEditing(false);
    // Simulating success message
    alert('Profile update simulated successfully! (Frontend only)');
    // TODO: Implement backend call to update profile in RDS/Cognito if needed
  };

  const handleLogout = () => {
    // Clear cookies
    removeCookie('access_token');
    removeCookie('id_token');
    removeCookie('refresh_token');
    localStorage.removeItem('isAuthenticated');
    setUser(null);
    
    // Redirect to Cognito's logout endpoint
    const logoutUrl = cognitoConfig.getLogoutUrl();
    window.location.href = logoutUrl; 
    // We use window.location.href for external redirects, 
    // navigate is for internal SPA routing.
  };

  const redirectToLogin = () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 h-[80vh]">
        <FaSpinner className="animate-spin text-teal-600 text-4xl" />
        <p className="ml-3 text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error || !user) { // If error or user is null after loading
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[80vh]">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <div className="bg-teal-100 p-4 rounded-full">
              <FaUser className="text-teal-600 text-3xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign In to Your Account</h2>
          <p className="text-gray-600 text-center mb-8">
            You need to be logged in to view and edit your profile.
          </p>
          <button
            onClick={loginWithCognito}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <FaSignOutAlt className="mr-2" /> Sign In with Cognito
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaUser className="mr-3 text-teal-600" /> User Profile
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your account information
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-12">
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-full shadow-md mb-4">
              <FaUser className="text-teal-600 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {user.firstname} {user.lastname}
            </h2>
            <p className="text-teal-100 mt-1">{user.email}</p>
          </div>
        </div>

        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="lastName"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors flex items-center"
                >
                  <FaSave className="mr-2" /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1\">First Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user.firstname || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1\">Last Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user.lastname || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1\">Email Address</p>
                  <div className="flex items-center">
                    <FaEnvelope className="text-teal-600 mr-2" />
                    <p className="text-lg font-semibold text-gray-800">{user.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1\">Phone Number</p>
                  <div className="flex items-center">
                    <FaPhone className="text-teal-600 mr-2" />
                    <p className="text-lg font-semibold text-gray-800">{user.phonenumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-6"> {/* Changed to justify-end for a single button */}
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md shadow-sm transition-colors flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;