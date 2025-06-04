class LoginPagePresenter {
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

  async handleLoginAttempt(email, password) {
    this._view.clearMessage();

    if (!email || !password) {
      this._view.displayMessage("Email dan password tidak boleh kosong.", true);
      return;
    }

    this._view.setSubmitButtonDisabled(true);
    this._view.showLoginLoading(true);
    this._view.displayMessage("Mencoba untuk login...", false, true);

    try {
      const response = await this._authAPI.login({ email, password });

      if (response.error) {
        this._view.displayMessage(
          response.message ||
            "Login gagal. Periksa kembali email dan password Anda.",
          true
        );
      } else if (response.loginResult && response.loginResult.token) {
        await this._authService.saveToken(response.loginResult.token);
        this._view.displayMessage(
          "Login berhasil! Mengarahkan ke beranda...",
          false
        );
        setTimeout(() => {
          this._view.navigateToHome();
        }, 1000);
      } else {
        this._view.displayMessage(
          "Gagal login, respons dari server tidak sesuai format.",
          true
        );
      }
    } catch (error) {
      this._view.displayMessage(
        error.message || "Terjadi kesalahan fatal saat mencoba login.",
        true
      );
    } finally {
      this._view.showLoginLoading(false);
      this._view.setSubmitButtonDisabled(false);
    }
  }
}

export default LoginPagePresenter;
