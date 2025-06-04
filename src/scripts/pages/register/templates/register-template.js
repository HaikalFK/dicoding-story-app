export const createRegisterTemplate = () => `
  <div class="auth-page-container">
    <section class="register-page">
      <h2>Registrasi Akun Baru</h2>
      <form id="register-form">
        <div class="form-group">
          <label for="name-input-register">Nama:</label>
          <input type="text" id="name-input-register" name="name" required>
        </div>
        <div class="form-group">
          <label for="email-input-register">Email:</label>
          <input type="email" id="email-input-register" name="email" required>
        </div>
        <div class="form-group">
          <label for="password-input-register">Password:</label>
          <input type="password" id="password-input-register" name="password" required minlength="8">
        </div>
        
        <div id="register-loading-spinner" style="display:none; text-align:center; margin: 15px 0;">
          <div class="spinner"></div>
        </div>

        <div id="message-container-register" class="message-display" style="display:none;"></div> 
        
        <button type="submit" class="button button-primary">Registrasi</button>
      </form>
      <p class="auth-switch">Sudah punya akun? <a href="#/login">Login di sini</a></p>
    </section>
  </div>
`;
