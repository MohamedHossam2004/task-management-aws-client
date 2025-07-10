import { cognitoConfig } from '../config/auth';
import { setCookie, getCookie, removeCookie, isTokenValid, parseJwt } from '../utils/cookieUtils';
import axios from 'axios';

/**
 * Authentication service for AWS Cognito integration
 */
class AuthService {
  /**
   * Redirect to Cognito login page
   */
  redirectToLogin() {
    const state = this.generateStateParam();
    const loginUrl = this.buildLoginUrl(state);
    window.location.href = loginUrl;
  }

  /**
   * Redirect to Cognito logout page
   */
  logout() {
    this.clearAuthTokens();
    window.location.href = cognitoConfig.getLogoutUrl();
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} authorizationCode - The authorization code from Cognito redirect
   * @param {string} state - The state parameter from redirect URL
   * @returns {Promise<Object>} - The token response
   */
  async exchangeCodeForTokens(authorizationCode, state) {
    // Verify state parameter
    const savedState = sessionStorage.getItem('oauth_state');
    if (savedState !== state) {
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    // Clear the state from session storage
    sessionStorage.removeItem('oauth_state');

    // Exchange authorization code for tokens
    const tokenEndpoint = `https://${cognitoConfig.DOMAIN}/oauth2/token`;
    const tokenData = new URLSearchParams();
    tokenData.append('grant_type', 'authorization_code');
    tokenData.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
    tokenData.append('code', authorizationCode);
    tokenData.append('redirect_uri', cognitoConfig.REDIRECT_SIGN_IN);

    try {
      const response = await axios.post(tokenEndpoint, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Store tokens in cookies
      this.storeTokens(
        response.data.id_token,
        response.data.access_token,
        response.data.refresh_token,
        response.data.expires_in
      );

      return response.data;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  }

  /**
   * Refresh tokens using refresh token
   * @returns {Promise<Object>} - The token response
   */
  async refreshTokens() {
    const refreshToken = getCookie('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const tokenEndpoint = `https://${cognitoConfig.DOMAIN}/oauth2/token`;
    const tokenData = new URLSearchParams();
    tokenData.append('grant_type', 'refresh_token');
    tokenData.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
    tokenData.append('refresh_token', refreshToken);

    try {
      const response = await axios.post(tokenEndpoint, tokenData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Store new tokens (refresh tokens don't expire, so we don't get a new one)
      this.storeTokens(
        response.data.id_token,
        response.data.access_token,
        null, // Refresh token doesn't change
        response.data.expires_in
      );

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // If refresh fails, clear tokens and redirect to login
      if (error.response && (error.response.status === 401 || error.response.status === 400)) {
        this.clearAuthTokens();
      }
      
      throw error;
    }
  }

  /**
   * Store tokens in cookies
   * @param {string} idToken - ID token
   * @param {string} accessToken - Access token
   * @param {string} refreshToken - Refresh token (optional)
   * @param {number} expiresIn - Token expiration in seconds
   */
  storeTokens(idToken, accessToken, refreshToken, expiresIn) {
    const commonOptions = {
      path: cognitoConfig.COOKIE_PATH,
      secure: cognitoConfig.COOKIE_SECURE,
      sameSite: 'strict',
      domain: cognitoConfig.COOKIE_DOMAIN
    };

    // Store access token
    setCookie('access_token', accessToken, {
      ...commonOptions,
      maxAge: expiresIn || cognitoConfig.ACCESS_TOKEN_EXPIRY
    });

    // Store ID token
    setCookie('id_token', idToken, {
      ...commonOptions,
      maxAge: expiresIn || cognitoConfig.ACCESS_TOKEN_EXPIRY
    });

    // Store refresh token if provided
    if (refreshToken) {
      setCookie('refresh_token', refreshToken, {
        ...commonOptions,
        maxAge: cognitoConfig.REFRESH_TOKEN_EXPIRY
      });
    }

    // Set authentication state in localStorage for UI purposes
    localStorage.setItem('isAuthenticated', 'true');
  }

  /**
   * Clear all auth tokens
   */
  clearAuthTokens() {
    const cookieOptions = {
      path: cognitoConfig.COOKIE_PATH,
      domain: cognitoConfig.COOKIE_DOMAIN
    };

    removeCookie('access_token', cookieOptions);
    removeCookie('id_token', cookieOptions);
    removeCookie('refresh_token', cookieOptions);
    localStorage.removeItem('isAuthenticated');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    const accessToken = getCookie('access_token');
    return accessToken ? isTokenValid(accessToken) : false;
  }

  /**
   * Get user info from ID token
   * @returns {Object|null} - User info or null if not authenticated
   */
  getUserInfo() {
    const idToken = getCookie('id_token');
    
    if (!idToken) {
      return null;
    }

    try {
      const payload = parseJwt(idToken);
      
      return {
        sub: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        phone: payload.phone_number || '',
        username: payload['cognito:username'] || '',
      };
    } catch (error) {
      console.error('Error parsing ID token:', error);
      return null;
    }
  }

  /**
   * Generate a random state parameter for CSRF protection
   * @returns {string} - Random state string
   */
  generateStateParam() {
    const state = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  /**
   * Build Cognito login URL with necessary parameters
   * @param {string} state - State parameter for CSRF protection
   * @returns {string} - Complete login URL
   */
  buildLoginUrl(state) {
    const authorizationUrl = new URL(`https://${cognitoConfig.DOMAIN}/login`);
    authorizationUrl.searchParams.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
    authorizationUrl.searchParams.append('response_type', cognitoConfig.RESPONSE_TYPE);
    authorizationUrl.searchParams.append('redirect_uri', cognitoConfig.REDIRECT_SIGN_IN);
    authorizationUrl.searchParams.append('scope', cognitoConfig.getScopes());
    authorizationUrl.searchParams.append('state', state);
    return authorizationUrl.toString();
  }

  /**
   * Get access token for API requests
   * @returns {string|null} - Access token or null
   */
  getAccessToken() {
    return getCookie('access_token');
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;