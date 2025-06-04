import HomePagePresenter from "./home-page-presenter.js";
import {
  createStoryItemTemplate,
  createHomePageTemplate,
} from "./templates/home-template.js";
import PushNotification from "../../utils/push-notification.js";

class HomePage {
  constructor(models) {
    this._presenter = new HomePagePresenter(this, models);
    this._map = null;
    this._swRegistration = null;

    this._storyListContainerEl = null;
    this._loadingIndicatorEl = null;
    this._messageContainerEl = null;
    this._mapContainerHomeEl = null;
    this._mapLoadingIndicatorEl = null;
    this._btnSubscribePushEl = null;
    this._btnUnsubscribePushEl = null;
    this._pushNotificationStatusEl = null;
  }

  async render() {
    return createHomePageTemplate();
  }

  async afterRender() {
    this._storyListContainerEl = document.querySelector(
      "#story-list-container"
    );
    this._loadingIndicatorEl = document.querySelector("#loading-indicator");
    this._messageContainerEl = document.querySelector("#message-display-home");
    this._mapContainerHomeEl = document.querySelector("#map-container-home");
    this._mapLoadingIndicatorEl = document.querySelector(
      "#map-loading-indicator"
    );
    this._btnSubscribePushEl = document.querySelector("#btn-subscribe-push");
    this._btnUnsubscribePushEl = document.querySelector(
      "#btn-unsubscribe-push"
    );
    this._pushNotificationStatusEl = document.querySelector(
      "#push-notification-status"
    );

    if (
      !this._storyListContainerEl ||
      !this._loadingIndicatorEl ||
      !this._messageContainerEl ||
      !this._mapContainerHomeEl ||
      !this._mapLoadingIndicatorEl ||
      !this._btnSubscribePushEl ||
      !this._btnUnsubscribePushEl ||
      !this._pushNotificationStatusEl
    ) {
    }

    await this._presenter.onViewReady();
    await this._initializePushNotificationFeature();
    this._setupSaveStoryButtonListeners();
  }

  _setupSaveStoryButtonListeners() {
    if (this._storyListContainerEl) {
      this._storyListContainerEl.addEventListener("click", (event) => {
        const saveButton = event.target.closest(".btn-save-story");
        if (saveButton && !saveButton.disabled) {
          const storyId = saveButton.dataset.storyId;
          if (storyId) {
            this._presenter.handleSaveStoryRequest(storyId);
          } else {
            this.displayMessage("ID cerita tidak ditemukan pada tombol.", true);
          }
        }
      });
    }
  }

  renderStoryList(stories, savedStoryIdsSet = new Set()) {
    if (!this._storyListContainerEl) return;

    this.clearMessage();
    this.showMainLoading(false);

    if (stories && stories.length > 0) {
      this._storyListContainerEl.innerHTML = "";
      const fragment = document.createDocumentFragment();
      stories.forEach((story) => {
        const isSaved = savedStoryIdsSet.has(story.id);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = createStoryItemTemplate(story, isSaved).trim();
        if (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
      });
      this._storyListContainerEl.appendChild(fragment);
    } else {
      this.showNoStoriesMessage();
    }
  }

  updateSaveButtonState(storyId, isSaved) {
    if (!this._storyListContainerEl) return;
    const saveButton = this._storyListContainerEl.querySelector(
      `.btn-save-story[data-story-id="${storyId}"]`
    );
    if (saveButton) {
      saveButton.disabled = isSaved;
      saveButton.innerHTML = `<i class="fas ${
        isSaved ? "fa-check-circle" : "fa-save"
      }"></i> ${isSaved ? "Tersimpan" : "Simpan"}`;

      saveButton.classList.remove(
        "button-secondary",
        "button-save-offline",
        "button-success"
      );

      if (isSaved) {
        saveButton.classList.add("button-success");
      } else {
        saveButton.classList.add("button-save-offline");
      }
    }
  }

  async _initializePushNotificationFeature() {
    if (
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      if (this._pushNotificationStatusEl)
        this._pushNotificationStatusEl.textContent =
          "Notifikasi push tidak didukung browser ini.";
      if (this._btnSubscribePushEl)
        this._btnSubscribePushEl.style.display = "none";
      if (this._btnUnsubscribePushEl)
        this._btnUnsubscribePushEl.style.display = "none";
      return;
    }
    if (!this._swRegistration) {
      this._swRegistration = await PushNotification.init();
    }
    if (this._swRegistration) {
      this._updatePushSubscriptionButtonUI();
      this._setupPushNotificationButtonListeners();
    } else {
      if (this._btnSubscribePushEl)
        this._btnSubscribePushEl.style.display = "none";
      if (this._btnUnsubscribePushEl)
        this._btnUnsubscribePushEl.style.display = "none";
      if (this._pushNotificationStatusEl)
        this._pushNotificationStatusEl.textContent =
          "Layanan notifikasi gagal diinisialisasi.";
    }
  }

  _setupPushNotificationButtonListeners() {
    if (this._btnSubscribePushEl) {
      this._btnSubscribePushEl.addEventListener("click", async () => {
        if (this._pushNotificationStatusEl)
          this._pushNotificationStatusEl.textContent = "Memproses langganan...";
        try {
          await PushNotification.subscribeUser(this._swRegistration);
          if (this._pushNotificationStatusEl)
            this._pushNotificationStatusEl.textContent =
              "Anda telah berlangganan notifikasi!";
          this._updatePushSubscriptionButtonUI();
        } catch (error) {
          if (this._pushNotificationStatusEl)
            this._pushNotificationStatusEl.textContent = `Gagal berlangganan: ${error.message}`;
        }
      });
    }
    if (this._btnUnsubscribePushEl) {
      this._btnUnsubscribePushEl.addEventListener("click", async () => {
        if (this._pushNotificationStatusEl)
          this._pushNotificationStatusEl.textContent =
            "Memproses berhenti langganan...";
        try {
          await PushNotification.unsubscribeUser(this._swRegistration);
          if (this._pushNotificationStatusEl)
            this._pushNotificationStatusEl.textContent =
              "Anda telah berhenti berlangganan notifikasi.";
          this._updatePushSubscriptionButtonUI();
        } catch (error) {
          if (this._pushNotificationStatusEl)
            this._pushNotificationStatusEl.textContent = `Gagal berhenti berlangganan: ${error.message}`;
        }
      });
    }
  }

  async _updatePushSubscriptionButtonUI() {
    if (
      !this._swRegistration ||
      !this._btnSubscribePushEl ||
      !this._btnUnsubscribePushEl
    )
      return;
    const permission = Notification.permission;
    if (permission === "denied") {
      if (this._pushNotificationStatusEl)
        this._pushNotificationStatusEl.textContent =
          "Izin notifikasi diblokir.";
      this._btnSubscribePushEl.style.display = "none";
      this._btnUnsubscribePushEl.style.display = "none";
      return;
    }
    const subscription = await PushNotification.getCurrentSubscription(
      this._swRegistration
    );
    if (subscription) {
      this._btnSubscribePushEl.style.display = "none";
      this._btnUnsubscribePushEl.style.display = "inline-block";
      if (
        this._pushNotificationStatusEl &&
        !this._pushNotificationStatusEl.textContent
          .toLowerCase()
          .includes("gagal")
      ) {
        this._pushNotificationStatusEl.textContent =
          "Status: Berlangganan notifikasi.";
      }
    } else {
      this._btnSubscribePushEl.style.display = "inline-block";
      this._btnUnsubscribePushEl.style.display = "none";
      if (
        this._pushNotificationStatusEl &&
        !this._pushNotificationStatusEl.textContent
          .toLowerCase()
          .includes("gagal")
      ) {
        this._pushNotificationStatusEl.textContent =
          "Status: Belum berlangganan notifikasi.";
      }
    }
  }

  showMainLoading(isLoading) {
    if (this._loadingIndicatorEl)
      this._loadingIndicatorEl.style.display = isLoading ? "block" : "none";
  }
  displayMessage(message, type = "info") {
    if (this._messageContainerEl) {
      this._messageContainerEl.textContent = message;
      this._messageContainerEl.className = "message-display";
      if (type === "error")
        this._messageContainerEl.classList.add("error-message");
      else if (type === "success")
        this._messageContainerEl.classList.add("success-message");
      else this._messageContainerEl.classList.add("info-message");
      this._messageContainerEl.style.display = "block";
    }
  }
  displayMainError(message) {
    this.displayMessage(message, "error");
  }
  displayInfoMessage(message) {
    this.displayMessage(message, "info");
  }
  showClearOfflineSuccessMessage(message) {
    this.displayMessage(message, "success");
  }
  showClearOfflineErrorMessage(message) {
    this.displayMessage(message, "error");
  }
  clearMessage() {
    if (this._messageContainerEl) {
      this._messageContainerEl.textContent = "";
      this._messageContainerEl.style.display = "none";
      this._messageContainerEl.className = "message-display";
    }
  }
  clearStoryListAndMessages() {
    if (this._storyListContainerEl) this._storyListContainerEl.innerHTML = "";
    this.clearMessage();
    if (this._loadingIndicatorEl && !this._storyListContainerEl.innerHTML)
      this._loadingIndicatorEl.style.display = "block";
  }
  showNoStoriesMessage() {
    if (this._storyListContainerEl)
      this._storyListContainerEl.innerHTML =
        '<p style="text-align:center; padding: 20px;">Belum ada cerita untuk ditampilkan.</p>';
  }
  showMapMessage(isLoadingOrVisible, message = "Memuat peta...") {
    if (this._mapLoadingIndicatorEl) {
      this._mapLoadingIndicatorEl.textContent = message;
      this._mapLoadingIndicatorEl.style.display = isLoadingOrVisible
        ? "block"
        : "none";
    }
  }
  initializeMapAndMarkers(storiesWithLocation) {
    if (!this._mapContainerHomeEl || typeof L === "undefined") {
      this.showMapMessage(true, "Gagal memuat library atau kontainer peta.");
      return;
    }
    this.showMapMessage(false);
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    const osmTile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "&copy; OSM contributors", maxZoom: 19 }
    );
    const esriSatelliteTile = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; ...", maxZoom: 18 }
    );
    const cartoLabelsTile = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      { attribution: "&copy; OSM &copy; CARTO", pane: "labels", maxZoom: 19 }
    );
    const satelliteWithLabelsGroup = L.layerGroup([
      esriSatelliteTile,
      cartoLabelsTile,
    ]);
    const baseLayers = {
      "Peta Jalan": osmTile,
      "Satelit (Label)": satelliteWithLabelsGroup,
    };
    try {
      this._map = L.map(this._mapContainerHomeEl, {
        layers: [osmTile],
      }).setView([-2.548926, 118.0148634], 5);
      if (!this._map.getPane("labels")) {
        this._map.createPane("labels");
        this._map.getPane("labels").style.zIndex = 350;
        this._map.getPane("labels").style.pointerEvents = "none";
      }
      L.control
        .layers(baseLayers, null, { position: "topright" })
        .addTo(this._map);
      if (storiesWithLocation && storiesWithLocation.length > 0) {
        storiesWithLocation.forEach((story) => {
          if (story.lat != null && story.lon != null) {
            const marker = L.marker([story.lat, story.lon]).addTo(this._map);
            const popupContent = `<div class="story-popup"><h4>${
              story.name
            }</h4><img src="${story.photoUrl}" alt="Foto cerita oleh ${
              story.name
            }" style="width:100px; height:auto; margin-bottom:5px;"><p>${story.description.substring(
              0,
              70
            )}...</p><a href="#/stories/${story.id}">Lihat detail</a></div>`;
            marker.bindPopup(popupContent);
          }
        });
      } else {
        if (this._map) {
          L.popup()
            .setLatLng([-2.548926, 118.0148634])
            .setContent("Tidak ada lokasi cerita untuk ditampilkan.")
            .openOn(this._map);
        }
      }
    } catch (mapError) {
      this.showMapMessage(true, "Terjadi kesalahan saat menampilkan peta.");
    }
  }
  navigateToLogin() {
    window.location.hash = "#/login";
  }
  async cleanup() {
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }
}

export default HomePage;
