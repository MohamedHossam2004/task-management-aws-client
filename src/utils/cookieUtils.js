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