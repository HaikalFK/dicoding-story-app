import {
  getAllStories as getAllStoriesFromDB,
  deleteAllStories as deleteAllStoriesFromDB,
  putStory as putStoryToDB,
  getStoryById as getStoryByIdFromDB,
} from "../../utils/idb-helper.js";

class HomePagePresenter {
  constructor(view, models) {
    this._view = view;
    this._authAPI = models.authAPI;
    this._authService = models.authService;
    this._stories = [];
    this._savedStoryIds = new Set();
  }

  async onViewReady() {
    if (!(await this._authService.isUserLoggedIn())) {
      this._view.navigateToLogin();
      return;
    }
    await this._loadInitialStories();
  }

  async _loadInitialStories() {
    this._view.showMainLoading(true);
    this._view.clearStoryListAndMessages();
    this._view.showMapMessage(true, "Memuat data peta...");
    let displayedFromDB = false;

    await this._loadSavedStoryIds();

    try {
      const storiesFromDB = await getAllStoriesFromDB();
      if (storiesFromDB && storiesFromDB.length > 0) {
      }
    } catch (dbError) {
      console.error(
        "HomePagePresenter: Error fetching stories from IndexedDB:",
        dbError
      );
    }

    await this._fetchStoriesFromNetwork(displayedFromDB);
  }

  async _fetchStoriesFromNetwork(wasDataDisplayedFromDB) {
    if (!wasDataDisplayedFromDB) {
      this._view.showMainLoading(true);
    }

    try {
      const token = await this._authService.getToken();
      const response = await this._authAPI.getAllStories(token, {
        page: 1,
        size: 20,
        location: 0,
      });

      if (response.error) {
        if (!wasDataDisplayedFromDB && this._stories.length === 0) {
          this._view.displayMainError(
            response.message || "Gagal memuat cerita."
          );
          this._view.showMapMessage(false, "Gagal memuat data lokasi cerita.");
        } else if (wasDataDisplayedFromDB) {
          this._view.displayInfoMessage(
            "Gagal mengambil versi terbaru. Menampilkan data tersimpan."
          );
        }
      } else if (response.listStory) {
        this._stories = response.listStory;

        this._view.clearMessage();
        this._view.renderStoryList(this._stories, this._savedStoryIds);
        this._updateMapFromStories(this._stories);
      } else {
        if (!wasDataDisplayedFromDB && this._stories.length === 0) {
          this._view.displayMainError(
            "Data cerita tidak ditemukan dari server."
          );
          this._view.showMapMessage(
            false,
            "Data cerita tidak tersedia untuk peta."
          );
        }
      }
    } catch (networkError) {
      if (!wasDataDisplayedFromDB && this._stories.length === 0) {
        this._view.displayMainError(
          networkError.message ||
            "Terjadi kesalahan saat mengambil data cerita."
        );
        this._view.showMapMessage(
          false,
          "Terjadi kesalahan saat memuat data lokasi."
        );
      } else if (wasDataDisplayedFromDB) {
        this._view.displayInfoMessage(
          "Gagal terhubung ke jaringan. Menampilkan data tersimpan."
        );
      }
    } finally {
      this._view.showMainLoading(false);
    }
  }

  _updateMapFromStories(stories) {
    const storiesWithLocation = stories.filter(
      (story) =>
        story.lat != null &&
        story.lon != null &&
        story.lat !== 0 &&
        story.lon !== 0
    );

    if (storiesWithLocation.length > 0) {
      this._view.showMapMessage(false);
      this._view.initializeMapAndMarkers(storiesWithLocation);
    } else {
      this._view.showMapMessage(
        false,
        "Tidak ada cerita dengan data lokasi untuk ditampilkan di peta."
      );
    }
  }

  async _loadSavedStoryIds() {
    try {
      const savedStories = await getAllStoriesFromDB();
      this._savedStoryIds = new Set(savedStories.map((s) => s.id));
    } catch (error) {
      this._savedStoryIds = new Set();
    }
  }

  async handleSaveStoryRequest(storyIdToSave) {
    const storyToSave = this._stories.find(
      (story) => story.id === storyIdToSave
    );

    if (!storyToSave) {
      this._view.displayMessage(
        "Gagal menemukan data cerita untuk disimpan. Coba refresh halaman.",
        true
      );
      return;
    }

    if (this._savedStoryIds.has(storyToSave.id)) {
      this._view.displayMessage("Cerita ini sudah tersimpan.", false, true);
      return;
    }

    this._view.displayMessage(
      `Menyimpan cerita "${storyToSave.name.substring(0, 20)}..."`,
      false,
      true
    );
    try {
      const storyWithTimestamp = {
        ...storyToSave,
        savedAt: new Date().toISOString(),
      };
      await putStoryToDB(storyWithTimestamp);
      this._savedStoryIds.add(storyToSave.id);
      this._view.updateSaveButtonState(storyToSave.id, true);
      this._view.displayMessage(
        `Cerita "${storyToSave.name.substring(0, 20)}..." berhasil disimpan!`,
        false
      );
    } catch (error) {
      this._view.displayMessage("Gagal menyimpan cerita offline.", true);
    }
  }

  async handleClearOfflineStoriesRequest() {
    console.log(
      "Tombol Hapus Semua Cerita Offline di Beranda akan diubah fungsinya."
    );
    this._view.displayInfoMessage(
      'Fitur hapus semua cerita telah dipindahkan ke halaman "Cerita Tersimpan".',
      true
    );
  }
}

export default HomePagePresenter;
