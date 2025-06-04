import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";
import AuthAPI from "../data/api.js";
import AuthService from "../utils/auth-service.js";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  _currentPage = null;
  _models = null;

  #navLogin = null;
  #navRegister = null;
  #navAddStory = null;
  #navLogout = null;
  #navSavedStories = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this._currentPage = null;

    this._models = {
      authAPI: AuthAPI,
      authService: AuthService,
    };

    this.#navLogin = document.querySelector("#nav-login");
    this.#navRegister = document.querySelector("#nav-register");
    this.#navAddStory = document.querySelector("#nav-add-story");
    this.#navLogout = document.querySelector("#nav-logout");
    this.#navSavedStories = document.querySelector("#nav-saved-stories");

    this._setupDrawer();
    this._setupLogoutButton();
    this._updateNavigationVisibility();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
      const clickedLink = event.target.closest("#nav-list a");
      if (clickedLink && this.#navigationDrawer.contains(clickedLink)) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  _setupLogoutButton() {
    if (this.#navLogout) {
      this.#navLogout.addEventListener("click", async (event) => {
        event.preventDefault();
        if (
          this._currentPage &&
          typeof this._currentPage.cleanup === "function"
        ) {
          await this._currentPage.cleanup();
        }
        await AuthService.removeToken();
        await this._updateNavigationVisibility();
        window.location.hash = "#/login";
        this.#navigationDrawer.classList.remove("open");
      });
    }
  }

  async _updateNavigationVisibility() {
    const isLoggedIn = await AuthService.isUserLoggedIn();
    if (this.#navLogin)
      this.#navLogin.style.display = isLoggedIn ? "none" : "block";
    if (this.#navRegister)
      this.#navRegister.style.display = isLoggedIn ? "none" : "block";
    if (this.#navAddStory)
      this.#navAddStory.style.display = isLoggedIn ? "block" : "none";
    if (this.#navLogout)
      this.#navLogout.style.display = isLoggedIn ? "block" : "none";
    if (this.#navSavedStories)
      this.#navSavedStories.style.display = isLoggedIn ? "block" : "none";
  }

  async renderPage() {
    await this._updateNavigationVisibility();
    const urlPattern = getActiveRoute();
    const pageFactory = routes[urlPattern];

    const updateDOM = async () => {
      if (
        this._currentPage &&
        typeof this._currentPage.cleanup === "function"
      ) {
        await this._currentPage.cleanup();
      }
      if (this.#content && pageFactory && typeof pageFactory === "function") {
        this._currentPage = pageFactory(this._models);
        try {
          this.#content.innerHTML = await this._currentPage.render();
          if (typeof this._currentPage.afterRender === "function") {
            await this._currentPage.afterRender();
          }
        } catch (error) {
          console.error(
            `App.js: Error during page render/afterRender for ${
              pageFactory.name || "page"
            }:`,
            error
          );
          this.#content.innerHTML =
            "<h2>Terjadi kesalahan fatal saat memuat halaman ini.</h2>";
          this._currentPage = null;
        }
      } else {
        console.warn(
          `App.js: Page factory for URL pattern "${urlPattern}" not found or is not a valid function.`
        );
        this.#content.innerHTML =
          '<h2>Halaman tidak ditemukan (404)</h2><p><a href="#/">Kembali ke Beranda</a></p>';
        this._currentPage = null;
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await updateDOM();
      });
    } else {
      await updateDOM();
    }
  }
}

export default App;
