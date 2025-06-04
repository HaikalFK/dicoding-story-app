export const createLoginTemplate = () => `
  <div class="auth-page-container">
    <section class="login-page">
      <h2>Login Pengguna</h2>
      <form id="login-form">
        <div class="form-group">
          <label for="email-input">Email:</label>
          <input type="email" id="email-input" name="email" required>
        </div>
        
        <div class="form-group">
          <label for="password-input">Password:</label>
          <input type="password" id="password-input" name="password" required minlength="8">
        </div>

        <div id="login-loading-spinner" style="display:none; text-align:center; margin: 15px 0;">
          <div class="spinner"></div>
        </div>

        <div id="message-display-login" class="message-display" style="display:none;"></div> 
        
        <button type="submit" class="button button-primary">Login</button>
      </form>
      <p class="auth-switch">Belum punya akun? <a href="#/register">Registrasi di sini</a></p>
    </section>
  </div>
`;
