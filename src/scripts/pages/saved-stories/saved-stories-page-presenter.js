import {
  getAllStories as getAllStoriesFromDB,
  deleteStory as deleteStoryFromDB,
} from "../../utils/idb-helper.js";

class SavedStoriesPagePresenter {
  constructor(view, models) {
    this._view = view;
    this._authService = models.authService;
  }

  async onViewReady() {
    if (!(await this._authService.isUserLoggedIn())) {
      this._view.navigateToLogin();
      return;
    }
    await this._loadSavedStories();
  }

  async _loadSavedStories() {
    this._view.showLoading(true);
    this._view.clearSavedStoryListAndMessages();
    try {
      const stories = await getAllStoriesFromDB();
      if (stories && stories.length > 0) {
        this._view.renderSavedStoryList(stories);
      } else {
        this._view.showNoSavedStoriesMessage();
      }
    } catch (error) {
      this._view.displayMessage("Gagal memuat cerita tersimpan.", true);
    } finally {
      this._view.showLoading(false);
    }
  }

  async handleDeleteStoryRequest(storyId) {
    this._view.displayMessage("Menghapus cerita...", false, true);
    try {
      await deleteStoryFromDB(storyId);
      this._view.displayMessage(
        "Cerita berhasil dihapus dari daftar tersimpan.",
        false
      );
      await this._loadSavedStories();
    } catch (error) {
      this._view.displayMessage("Gagal menghapus cerita.", true);
    }
  }
}

export default SavedStoriesPagePresenter;
