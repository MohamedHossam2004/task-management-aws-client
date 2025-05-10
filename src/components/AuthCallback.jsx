import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCookie } from '../utils/cookieUtils';
import axios from 'axios';
import { cognitoConfig } from '../config/auth';

const AuthCallback = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    if (hasHandledCallback.current) {
      return;
    }
    hasHandledCallback.current = true;

    const handleCallback = async () => {
      try {
        // Extract the authorization code from URL
        const urlParams = new URLSearchParams(location.search);
        const authorizationCode = urlParams.get('code');

        if (!authorizationCode) {
          throw new Error('No authorization code found in the callback URL');
        }

        setLoading(true);

        // Verify state parameter to prevent CSRF attacks
        const savedState = sessionStorage.getItem('oauth_state');
        const urlState = urlParams.get('state');
        
        console.log('Debug State Parameter:', { 
          savedState, 
          urlState, 
          match: savedState === urlState 
        });
        
        if (!savedState || !urlState || savedState !== urlState) {
          throw new Error('Invalid state parameter. Possible CSRF attack.');
        }
        
        // Clear the state from session storage
        sessionStorage.removeItem('oauth_state');

        // Exchange authorization code for tokens using Cognito token endpoint
        const tokenEndpoint = `https://${cognitoConfig.DOMAIN}/oauth2/token`;
        const tokenData = new URLSearchParams();
        tokenData.append('grant_type', 'authorization_code');
        tokenData.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
        tokenData.append('code', authorizationCode);
        tokenData.append('redirect_uri', cognitoConfig.REDIRECT_SIGN_IN);
        
        console.log('Token Exchange Request:', {
          endpoint: tokenEndpoint,
          clientId: cognitoConfig.USER_POOL_WEB_CLIENT_ID,
          redirectUri: cognitoConfig.REDIRECT_SIGN_IN
        });
        
        try {
          const tokenResponse = await axios.post(tokenEndpoint, tokenData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
        
        const idToken = tokenResponse.data.id_token;
        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;
        const expiresIn = tokenResponse.data.expires_in;

        // Store tokens in cookies with secure attributes based on config
        const commonOptions = {
          path: cognitoConfig.COOKIE_PATH,
          secure: cognitoConfig.COOKIE_SECURE, // Only sent over HTTPS
          sameSite: 'strict', // Protection against CSRF
          domain: cognitoConfig.COOKIE_DOMAIN
        };

        // Store access token
        setCookie('access_token', accessToken, {
          ...commonOptions,
          maxAge: expiresIn // Match token expiry time
        });

        // Store ID token
        setCookie('id_token', idToken, {
          ...commonOptions,
          maxAge: expiresIn // Same expiry as access token
        });
        
        // Store refresh token with longer expiry
        setCookie('refresh_token', refreshToken, {
          ...commonOptions,
          maxAge: cognitoConfig.REFRESH_TOKEN_EXPIRY
        });

        // Set authentication state in localStorage for UI purposes
        localStorage.setItem('isAuthenticated', 'true');

        // Redirect to the main application
        navigate('/tasks');
        } catch (tokenError) {
          console.error('Token exchange error:', tokenError.response?.data || tokenError.message);
          throw new Error(`Token exchange failed: ${tokenError.response?.data?.error || tokenError.message}`);
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err.message || 'Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your login...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-700">
              Authentication error: {error}
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;