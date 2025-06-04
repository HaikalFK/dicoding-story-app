import "../styles/styles.css";
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  const skipLink = document.querySelector(".skip-to-content");
  const mainContent = document.querySelector("#main-content");

  if (skipLink && mainContent) {
    skipLink.addEventListener("click", function (event) {
      event.preventDefault();
      this.blur();
      mainContent.focus();
    });
  } else {
    if (!skipLink) {
      console.warn(
        "Peringatan: Elemen tautan .skip-to-content tidak ditemukan di DOM."
      );
    }
    if (!mainContent) {
      console.warn("Peringatan: Elemen #main-content tidak ditemukan di DOM.");
    }
  }

  const currentYearSpan = document.querySelector("#current-year");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
