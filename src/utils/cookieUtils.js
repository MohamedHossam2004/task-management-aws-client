// Cookie utility functions for token management

// Set a cookie with the given name, value, and options
export function setCookie(name, value, options = {}) {
  const cookieOptions = {
    path: '/',
    ...options
  };

  let cookieString = `${name}=${encodeURIComponent(value)}`;

  if (cookieOptions.maxAge) {
    cookieString += `; max-age=${cookieOptions.maxAge}`;
  }
  if (cookieOptions.expires) {
    cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
  }
  if (cookieOptions.path) {
    cookieString += `; path=${cookieOptions.path}`;
  }
  if (cookieOptions.domain) {
    cookieString += `; domain=${cookieOptions.domain}`;
  }
  if (cookieOptions.secure) {
    cookieString += '; secure';
  }
  if (cookieOptions.sameSite) {
    cookieString += `; samesite=${cookieOptions.sameSite}`;
  }
  if (cookieOptions.httpOnly) {
    cookieString += '; httponly';
  }

  document.cookie = cookieString;
}

// Get a cookie value by name
export function getCookie(name) {
  const nameString = `${name}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(nameString) === 0) {
      return cookie.substring(nameString.length, cookie.length);
    }
  }
  return null;
}

// Remove a cookie by name
export function removeCookie(name, options = {}) {
  const cookieOptions = {
    path: '/',
    ...options,
    maxAge: -1, // Expire immediately
  };
  
  setCookie(name, '', cookieOptions);
}

// Parse and decode JWT token
export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Check if a token is valid
export function isTokenValid(token) {
  if (!token) return false;
  
  try {
    const decodedToken = parseJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken && decodedToken.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Check if token needs refresh (expires in next 5 minutes)
export function shouldRefreshToken(token) {
  if (!token) return false;
  
  try {
    const decodedToken = parseJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = currentTime + (5 * 60); // 5 minutes buffer
    return decodedToken && decodedToken.exp <= fiveMinutesFromNow;
  } catch (error) {
    return false;
  }
}

// Proactive token refresh function
export async function refreshTokenIfNeeded() {
  const accessToken = getCookie('access_token');
  const refreshToken = getCookie('refresh_token');
  
  if (!accessToken || !refreshToken) {
    return false;
  }
  
  // Only refresh if token is close to expiry
  if (!shouldRefreshToken(accessToken)) {
    return true; // Token is still valid, no refresh needed
  }
  
  try {
    const { cognitoConfig } = await import('../config/auth');
    const axios = (await import('axios')).default;
    
    const tokenEndpoint = `https://${cognitoConfig.DOMAIN}/oauth2/token`;
    const tokenData = new URLSearchParams();
    tokenData.append('grant_type', 'refresh_token');
    tokenData.append('client_id', cognitoConfig.USER_POOL_WEB_CLIENT_ID);
    tokenData.append('refresh_token', refreshToken);
    
    const response = await axios.post(tokenEndpoint, tokenData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const newAccessToken = response.data.access_token;
    const newIdToken = response.data.id_token;
    const expiresIn = response.data.expires_in;
    
    // Store new tokens
    const cookieOptions = {
      path: cognitoConfig.COOKIE_PATH,
      secure: cognitoConfig.COOKIE_SECURE,
      sameSite: 'strict',
      domain: cognitoConfig.COOKIE_DOMAIN,
      maxAge: expiresIn || cognitoConfig.ACCESS_TOKEN_EXPIRY
    };
    
    setCookie('access_token', newAccessToken, cookieOptions);
    setCookie('id_token', newIdToken, cookieOptions);
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear expired tokens
    removeCookie('access_token');
    removeCookie('id_token');
    removeCookie('refresh_token');
    return false;
  }
}