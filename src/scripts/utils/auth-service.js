const AUTH_TOKEN_KEY = "authToken";

const AuthService = {
  async saveToken(token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  async removeToken() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  async isUserLoggedIn() {
    const token = await this.getToken();
    return !!token;
  },

};

export default AuthService;
