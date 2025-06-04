class RegisterPagePresenter {
  constructor(view, models) {
    this._view = view;
    this._authAPI = models.authAPI;
    this._authService = models.authService;
  }

  async onViewReady() {
    if (await this._authService.isUserLoggedIn()) {
      this._view.navigateToHome();
    }
  }

  async handleRegisterAttempt(name, email, password) {
    this._view.clearMessage();

    if (!name || !email || !password) {
      this._view.displayMessage("Semua field tidak boleh kosong.", true);
      return;
    }
    if (password.length < 8) {
      this._view.displayMessage("Password minimal harus 8 karakter.", true);
      return;
    }

    this._view.setSubmitButtonDisabled(true);
    this._view.showRegisterLoading(true);
    this._view.displayMessage("Mencoba mendaftarkan akun...", false, true);

    try {
      const response = await this._authAPI.register({ name, email, password });

      if (response.error) {
        this._view.displayMessage(
          response.message || "Registrasi gagal. Silakan coba lagi.",
          true
        );
      } else {
        this._view.displayMessage(
          response.message ||
            "Registrasi berhasil! Anda akan diarahkan ke halaman login.",
          false
        );
        setTimeout(() => {
          this._view.navigateToLogin();
        }, 2500);
      }
    } catch (error) {
      this._view.displayMessage(
        error.message || "Terjadi kesalahan fatal saat mencoba registrasi.",
        true
      );
    } finally {
      this._view.showRegisterLoading(false);
      this._view.setSubmitButtonDisabled(false);
    }
  }
}

export default RegisterPagePresenter;
