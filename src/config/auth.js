// AWS Cognito Configuration
export const cognitoConfig = {
  // Main configuration
  REGION: import.meta.env.VITE_AWS_REGION || "us-east-1",
  USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  USER_POOL_WEB_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,

  // Cognito hosted UI configuration
  DOMAIN: import.meta.env.VITE_COGNITO_DOMAIN,
  REDIRECT_SIGN_IN:
    import.meta.env.VITE_REDIRECT_SIGN_IN ||
    `${window.location.origin}/callback`,
  REDIRECT_SIGN_OUT:
    import.meta.env.VITE_REDIRECT_SIGN_OUT || window.location.origin,

  // Authentication flow
  RESPONSE_TYPE: "code", // Using authorization code grant flow

  // OAuth scopes requested
  SCOPE: ["email", "openid", "profile", "aws.cognito.signin.user.admin"],

  // Cookie configuration
  COOKIE_SECURE: import.meta.env.VITE_COOKIE_SECURE !== "false",
  COOKIE_DOMAIN: import.meta.env.VITE_COOKIE_DOMAIN || window.location.hostname,
  COOKIE_PATH: import.meta.env.VITE_COOKIE_PATH || "/",

  // Token expiration times in seconds
  ACCESS_TOKEN_EXPIRY: 30 * 24 * 60, // 1 hour
  REFRESH_TOKEN_EXPIRY: 30 * 24 * 60 * 60, // 30 days

  // Convert scope array to space-separated string for Cognito
  getScopes() {
    return this.SCOPE.join(" ");
  },

  // Construct login URL
  getLoginUrl() {
    return `https://${this.DOMAIN}/login?client_id=${this.USER_POOL_WEB_CLIENT_ID}&response_type=${this.RESPONSE_TYPE}&scope=${this.getScopes()}&redirect_uri=${encodeURIComponent(this.REDIRECT_SIGN_IN)}`;
  },

  // Construct logout URL
  getLogoutUrl() {
    return `https://${this.DOMAIN}/logout?client_id=${this.USER_POOL_WEB_CLIENT_ID}&logout_uri=${encodeURIComponent(this.REDIRECT_SIGN_OUT)}`;
  },
};
