import {
  getStoryById as getStoryByIdFromDB,
  putStory as putStoryToDB,
} from "../../utils/idb-helper.js";

class DetailPagePresenter {
  constructor(view, models) {
    this._view = view;
    this._authAPI = models.authAPI;
    this._authService = models.authService;
    this._story = null;
  }

  async onViewReady(storyId) {
    if (!(await this._authService.isUserLoggedIn())) {
      this._view.navigateToLogin();
      return;
    }

    if (!storyId) {
      this._view.showLoading(false);
      this._view.displayError(
        "ID Cerita tidak valid atau tidak ditemukan di URL."
      );
      return;
    }

    await this._loadStoryDetail(storyId);
  }

  async _loadStoryDetail(storyId) {
    this._view.showLoading(true);
    this._view.clearContentAndMessages();
    let displayedFromDB = false;

    try {
      const storyFromDB = await getStoryByIdFromDB(storyId);
      if (storyFromDB) {
        this._story = storyFromDB;
        this._view.renderStoryToDOM(this._story);
        if (this._story.lat != null && this._story.lon != null) {
          this._view.initializeAndShowMap(this._story);
        } else {
          this._view.hideMapDisplay();
        }
        this._view.showLoading(false);
        this._view.displayInfoMessage(
          "Menampilkan data offline. Mencoba mengambil versi terbaru..."
        );
        displayedFromDB = true;
      }
    } catch (dbError) {
      console.error(
        "DetailPagePresenter: Error fetching story from IndexedDB:",
        dbError
      );
    }

    try {
      const token = await this._authService.getToken();
      const response = await this._authAPI.getStoryDetail(token, storyId);

      if (response.error) {
        if (!displayedFromDB) {
          this._view.displayError(
            response.message || "Gagal memuat detail cerita."
          );
        } else {
          this._view.displayInfoMessage(
            "Gagal mengambil versi terbaru. Menampilkan data offline."
          );
        }
      } else if (response.story) {
        this._story = response.story;
        await putStoryToDB(this._story);

        this._view.clearMessage();
        this._view.renderStoryToDOM(this._story);
        if (this._story.lat != null && this._story.lon != null) {
          this._view.initializeAndShowMap(this._story);
        } else {
          this._view.hideMapDisplay();
        }
      } else {
        if (!displayedFromDB) {
          this._view.displayError(
            "Data detail cerita tidak ditemukan dari server."
          );
        }
      }
    } catch (networkError) {
      console.error(
        `DetailPagePresenter: Exception while fetching story detail from network:`,
        networkError
      );
      if (!displayedFromDB) {
        this._view.displayError(
          networkError.message ||
            "Terjadi kesalahan saat mengambil data detail cerita."
        );
      } else {
        this._view.displayInfoMessage(
          "Gagal terhubung ke jaringan. Menampilkan data offline."
        );
      }
    } finally {
      this._view.showLoading(false);
    }
  }
}

export default DetailPagePresenter;
