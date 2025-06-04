import HomePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import LoginPage from "../pages/login/login-page.js";
import RegisterPage from "../pages/register/register-page.js";
import DetailPage from "../pages/detail/detail-page.js";
import AddStoryPage from "../pages/add/add-story-page.js";
import SavedStoriesPage from "../pages/saved-stories/saved-stories-page.js";

const routes = {
  "/": (models) => new HomePage(models),
  "/about": (models) => new AboutPage(models),
  "/login": (models) => new LoginPage(models),
  "/register": (models) => new RegisterPage(models),
  "/stories/:id": (models) => new DetailPage(models),
  "/add": (models) => new AddStoryPage(models),
  "/saved-stories": (models) => new SavedStoriesPage(models),
};

export default routes;
