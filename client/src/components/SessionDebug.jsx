import React, { useState, useEffect } from 'react';

const SessionDebug = () => {
  const [sessionData, setSessionData] = useState({});
  const [cookies, setCookies] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Function to read session storage contents
    const readSessionStorage = () => {
      const data = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        try {
          data[key] = sessionStorage.getItem(key);
        } catch (error) {
          data[key] = `[Error reading: ${error.message}]`;
        }
      }
      setSessionData(data);
    };

    // Function to read cookies
    const readCookies = () => {
      const cookieList = document.cookie.split(';')
        .map(cookie => cookie.trim())
        .filter(cookie => cookie !== '')
        .map(cookie => {
          const [name, value] = cookie.split('=');
          return { name, value };
        });
      setCookies(cookieList);
    };

    // Initial read
    readSessionStorage();
    readCookies();

    // Set up interval to refresh data
    const interval = setInterval(() => {
      readSessionStorage();
      readCookies();
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const clearSession = () => {
    sessionStorage.clear();
    setSessionData({});
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <div className="fixed bottom-0 right-0 z-50">
      <button 
        className="bg-gray-800 text-white p-2 rounded-tl-md" 
        onClick={toggleDebug}
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>

      {showDebug && (
        <div className="bg-white border border-gray-300 p-4 shadow-lg rounded-tl-md max-w-md overflow-y-auto max-h-[50vh]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold">Session Debug</h3>
            <button 
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              onClick={clearSession}
            >
              Clear Session
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-md font-semibold mb-1">Session Storage:</h4>
            {Object.keys(sessionData).length > 0 ? (
              <ul className="text-sm bg-gray-100 p-2 rounded">
                {Object.entries(sessionData).map(([key, value]) => (
                  <li key={key} className="mb-1">
                    <span className="font-medium">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-gray-500">No session data</p>
            )}
          </div>

          <div>
            <h4 className="text-md font-semibold mb-1">Cookies:</h4>
            {cookies.length > 0 ? (
              <ul className="text-sm bg-gray-100 p-2 rounded">
                {cookies.map((cookie, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{cookie.name}:</span> {cookie.value.substring(0, 30)}...
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-gray-500">No cookies</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDebug;