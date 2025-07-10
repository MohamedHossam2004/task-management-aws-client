// Mock backend token exchange service
// This is a placeholder to simulate a backend token exchange endpoint
// In a real application, this would be a serverless function or API endpoint

export async function exchangeCodeForTokens(authorizationCode) {
  // In a real implementation, this would make a request to Cognito's token endpoint
  // with your client credentials
  console.log('Exchanging authorization code for tokens:', authorizationCode);
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock response data
  // This simulates what Cognito would return
  const mockTokenResponse = {
    id_token: createMockJwt({ 
      email: 'user@example.com',
      given_name: 'Test',
      family_name: 'User',
      'cognito:username': 'testuser',
      sub: 'mock-user-id-123'
    }, 3600),
    access_token: createMockJwt({
      client_id: 'mock-client-id',
      scope: 'email openid profile',
      username: 'testuser',
      sub: 'mock-user-id-123'
    }, 3600),
    refresh_token: 'mock-refresh-token-' + Math.random().toString(36).substring(2),
    expires_in: 3600,
    token_type: 'Bearer'
  };
  
  return mockTokenResponse;
}

export async function refreshTokens(refreshToken) {
  console.log('Refreshing tokens with refresh token:', refreshToken);
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock response data
  const mockRefreshResponse = {
    id_token: createMockJwt({ 
      email: 'user@example.com',
      given_name: 'Test',
      family_name: 'User',
      'cognito:username': 'testuser',
      sub: 'mock-user-id-123'
    }, 3600),
    access_token: createMockJwt({
      client_id: 'mock-client-id',
      scope: 'email openid profile',
      username: 'testuser',
      sub: 'mock-user-id-123'
    }, 3600),
    expires_in: 3600,
    token_type: 'Bearer'
  };
  
  return mockRefreshResponse;
}

// Helper function to create a mock JWT token
function createMockJwt(payload, expiresIn) {
  // Create a simple mock JWT
  // In a real scenario, this would be signed properly
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };
  
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(fullPayload));
  
  // In a real JWT, this would be a signature
  const mockSignature = btoa('mock-signature-' + Math.random());
  
  return `${base64Header}.${base64Payload}.${mockSignature}`;
}