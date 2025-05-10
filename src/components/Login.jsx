import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCookie } from '../utils/cookieUtils';
import { FaSignInAlt } from 'react-icons/fa';
import { cognitoConfig } from '../config/auth';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/tasks';

  useEffect(() => {
    // Check if already authenticated
    const accessToken = getCookie('access_token');
    if (accessToken) {
      // Redirect to the page they tried to visit or dashboard
      navigate(from, { replace: true });
      return;
    }
    
    // Clear any existing state on component mount
    sessionStorage.removeItem('oauth_state');
    
    // Auto-redirect is disabled for development purposes
    // Uncomment for production use
    // handleLoginClick();
  }, [navigate, from]);

  // Function to manually trigger the redirect
  const handleLoginClick = () => {
    // Clear any existing session storage first
    sessionStorage.clear();
    
    // Generate a fresh state parameter
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    console.log('Generated state:', state);
    
    // Save the state in session storage
    sessionStorage.setItem('oauth_state', state);
    
    // Redirect to Cognito login
    redirectToCognitoLogin(state);
  };

  // Helper function to redirect to Cognito login
  const redirectToCognitoLogin = (state) => {
    // Build the authorization URL with parameters
    const authorizationUrl = new URL(`https://${cognitoConfig.DOMAIN}/login`);
    authorizationUrl.searchParams.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
    authorizationUrl.searchParams.append('response_type', cognitoConfig.RESPONSE_TYPE);
    authorizationUrl.searchParams.append('redirect_uri', cognitoConfig.REDIRECT_SIGN_IN);
    authorizationUrl.searchParams.append('scope', cognitoConfig.getScopes());
    authorizationUrl.searchParams.append('state', state);

    console.log('Redirecting to:', authorizationUrl.toString());
    console.log('State parameter:', state);
    
    // Check that state is in sessionStorage before redirecting
    const storedState = sessionStorage.getItem('oauth_state');
    console.log('Stored state before redirect:', storedState);
    
    window.location.href = authorizationUrl.toString();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Task Manager Login</h2>
          <p className="text-gray-600 mb-6 text-center">
            Sign in to access your tasks and manage your productivity
          </p>
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleLoginClick}
              className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-md flex items-center justify-center"
            >
              <FaSignInAlt className="mr-2" /> Sign In with Cognito
            </button>
            
            <div className="text-center text-sm text-gray-500">
              Don't have an account yet? You'll be able to sign up on the next screen.
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default Login;