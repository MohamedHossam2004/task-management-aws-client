import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeCookie } from '../utils/cookieUtils';
import { FaSignOutAlt } from 'react-icons/fa';
import { cognitoConfig } from '../config/auth';

const SignOut = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = () => {
      // Clear all auth cookies
      removeCookie('access_token');
      removeCookie('id_token');
      removeCookie('refresh_token');
      
      // Clear any local storage items
      localStorage.removeItem('isAuthenticated');
      
      // Get Cognito logout URL from config
      const logoutUrl = cognitoConfig.getLogoutUrl();
      
      // Redirect to the logout URL
      window.location.href = logoutUrl;
    };
    
    // Short delay to show the logout message
    const timer = setTimeout(performLogout, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <FaSignOutAlt className="text-5xl text-teal-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Signing Out</h2>
        <p className="text-gray-600 mb-4">Please wait while we log you out...</p>
        <div className="animate-pulse bg-teal-100 h-1 w-full rounded-full">
          <div className="bg-teal-500 h-1 w-1/2 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SignOut;