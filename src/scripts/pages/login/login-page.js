import LoginPagePresenter from "./login-page-presenter.js";
import { createLoginTemplate } from "./templates/login-template.js";

class LoginPage {
  constructor(models) {
    this._presenter = new LoginPagePresenter(this, models);

    this._loginFormElement = null;
    this._emailInputElement = null;
    this._passwordInputElement = null;
    this._messageContainer = null;
    this._submitButton = null;
    this._loadingSpinnerElement = null;
  }

  async render() {
    return createLoginTemplate();
  }

  async afterRender() {
    this._loginFormElement = document.querySelector("#login-form");
    this._emailInputElement = document.querySelector("#email-input");
    this._passwordInputElement = document.querySelector("#password-input");
    this._messageContainer = document.querySelector("#message-display-login");
    this._loadingSpinnerElement = document.querySelector(
      "#login-loading-spinner"
    );

    if (this._loginFormElement) {
      this._submitButton = this._loginFormElement.querySelector(
        'button[type="submit"]'
      );
      this._loginFormElement.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = this._emailInputElement
          ? this._emailInputElement.value
          : "";
        const password = this._passwordInputElement
          ? this._passwordInputElement.value
          : "";
        await this._presenter.handleLoginAttempt(email, password);
      });
    } else {
      console.error(
        "VIEW (LoginPage): Login form element (#login-form) not found."
      );
    }

    if (!this._presenter || typeof this._presenter.onViewReady !== "function") {
      console.error(
        "VIEW (LoginPage): CRITICAL - Presenter or onViewReady method is not available!"
      );
      if (this._messageContainer)
        this.displayMessage(
          "Kesalahan internal aplikasi saat inisialisasi.",
          true
        );
    } else {
      await this._presenter.onViewReady();
    }
  }

  showLoginLoading(isLoading) {
    if (this._loadingSpinnerElement) {
      this._loadingSpinnerElement.style.display = isLoading ? "block" : "none";
    }
  }

  displayMessage(message, isError = false, isProcessing = false) {
    if (this._messageContainer) {
      this._messageContainer.textContent = message;
      let messageClass = "message-display";
      if (isError) {
        messageClass += " error-message";
      } else if (!isProcessing) {
        messageClass += " success-message";
      }
      this._messageContainer.className = messageClass;
      this._messageContainer.style.display = message ? "block" : "none";
    }
  }

  clearMessage() {
    if (this._messageContainer) {
      this._messageContainer.textContent = "";
      this._messageContainer.style.display = "none";
      this._messageContainer.className = "message-display";
    }
  }

  setSubmitButtonDisabled(isDisabled) {
    if (this._submitButton) {
      this._submitButton.disabled = isDisabled;
    }
  }

  navigateToHome() {
    window.location.hash = "#/";
  }

  navigateToLogin() {
    window.location.hash = "#/login";
  }

  async cleanup() {}
}

export default LoginPage;
