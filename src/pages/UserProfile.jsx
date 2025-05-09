import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaSignOutAlt, FaUserEdit } from 'react-icons/fa';

const UserProfile = () => {
  // This would normally come from your authentication system
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    isLoggedIn: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // This would normally send the data to your backend
    setUser({
      ...user,
      ...formData,
    });
    setIsEditing(false);
    // Simulating success message
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    // This would normally handle the logout process
    setUser({
      ...user,
      isLoggedIn: false,
    });
    // Redirect to login page or home page
    window.location.href = '/';
  };

  const loginWithCognito = () => {
    // Redirect to Cognito login
    alert('Redirecting to login...');
    // This would normally redirect to your Cognito hosted UI
    // window.location.href = 'YOUR_COGNITO_HOSTED_UI_URL';
  };

  if (!user.isLoggedIn) {
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
              {user.firstName} {user.lastName}
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
                      name="firstName"
                      value={formData.firstName}
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
                      name="lastName"
                      value={formData.lastName}
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
                      name="phone"
                      value={formData.phone}
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
                  <p className="text-sm font-medium text-gray-500 mb-1">First Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user.firstName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Last Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user.lastName}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Email Address</p>
                  <div className="flex items-center">
                    <FaEnvelope className="text-teal-600 mr-2" />
                    <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Phone Number</p>
                  <div className="flex items-center">
                    <FaPhone className="text-teal-600 mr-2" />
                    <p className="text-lg font-semibold text-gray-800">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md shadow-sm transition-colors flex items-center"
                >
                  <FaUserEdit className="mr-2" /> Edit Profile
                </button>
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