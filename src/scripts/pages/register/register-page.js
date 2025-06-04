import RegisterPagePresenter from "./register-page-presenter.js";
import { createRegisterTemplate } from "./templates/register-template.js";

class RegisterPage {
  constructor(models) {
    this._presenter = new RegisterPagePresenter(this, models);

    this._registerFormElement = null;
    this._nameInputElement = null;
    this._emailInputElement = null;
    this._passwordInputElement = null;
    this._messageContainer = null;
    this._submitButton = null;
  }

  async render() {
    return createRegisterTemplate();
  }

  async afterRender() {
    this._registerFormElement = document.querySelector("#register-form");
    this._nameInputElement = document.querySelector("#name-input-register");
    this._emailInputElement = document.querySelector("#email-input-register");
    this._passwordInputElement = document.querySelector(
      "#password-input-register"
    );
    this._messageContainer = document.querySelector(
      "#message-container-register"
    );
    this._loadingSpinnerElement = document.querySelector(
      "#register-loading-spinner"
    );

    if (this._registerFormElement) {
      this._submitButton = this._registerFormElement.querySelector(
        'button[type="submit"]'
      );
      this._registerFormElement.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = this._nameInputElement ? this._nameInputElement.value : "";
        const email = this._emailInputElement
          ? this._emailInputElement.value
          : "";
        const password = this._passwordInputElement
          ? this._passwordInputElement.value
          : "";

        if (
          !this._presenter ||
          typeof this._presenter.handleRegisterAttempt !== "function"
        ) {
          this.displayMessage("Kesalahan internal aplikasi.", true);
          return;
        }
        await this._presenter.handleRegisterAttempt(name, email, password);
      });
    } else {
      console.error(
        "VIEW (RegisterPage): Register form element (#register-form) not found."
      );
    }

    if (!this._presenter || typeof this._presenter.onViewReady !== "function") {
      this.displayMessage(
        "Kesalahan internal aplikasi saat inisialisasi.",
        true
      );
    } else {
      await this._presenter.onViewReady();
    }
  }

  showRegisterLoading(isLoading) {
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

  navigateToLogin() {
    window.location.hash = "#/login";
  }

  navigateToHome() {
    window.location.hash = "#/";
  }

  async cleanup() {}
}

export default RegisterPage;
