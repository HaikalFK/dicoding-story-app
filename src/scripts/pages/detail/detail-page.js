import DetailPagePresenter from "./detail-page-presenter.js";
import {
  createDetailPageTemplate,
  createStoryDetailContentTemplate,
} from "./templates/detail-template.js";
import { parseActivePathname } from "../../routes/url-parser.js";

class DetailPage {
  constructor(models) {
    this._presenter = new DetailPagePresenter(this, models);
    this._map = null;
    this._loadingIndicatorEl = null;
    this._messageContainerEl = null;
    this._storyContentContainerEl = null;
    this._mapContainerEl = null;
  }

  async render() {
    return createDetailPageTemplate();
  }

  async afterRender() {
    this._loadingIndicatorEl = document.querySelector(
      "#detail-loading-indicator"
    );
    this._messageContainerEl = document.querySelector(
      "#message-display-detail"
    );
    this._storyContentContainerEl = document.querySelector(
      "#story-detail-content-container"
    );

    if (
      !this._loadingIndicatorEl ||
      !this._messageContainerEl ||
      !this._storyContentContainerEl
    ) {
      const mainContent = document.querySelector("#main-content");
      if (mainContent)
        mainContent.innerHTML =
          "<p>Error: Gagal memuat komponen UI halaman detail.</p>";
      console.error(
        "DetailPage afterRender: One or more critical UI shell elements not found after rendering DetailPageTemplate!"
      );
      return;
    }

    const pathSegments = parseActivePathname();
    const storyId = pathSegments.id;

    await this._presenter.onViewReady(storyId);
  }

  showLoading(isLoading) {
    if (this._loadingIndicatorEl) {
      this._loadingIndicatorEl.style.display = isLoading ? "block" : "none";
    }
  }

  clearContentAndMessages() {
    if (this._storyContentContainerEl)
      this._storyContentContainerEl.innerHTML = "";
    if (this._messageContainerEl)
      this._messageContainerEl.style.display = "none";
    if (this._loadingIndicatorEl && !this._storyContentContainerEl.innerHTML) {
      this._loadingIndicatorEl.style.display = "block";
    }
  }

  displayMessage(message, type = "info") {
    if (this._messageContainerEl) {
      this._messageContainerEl.textContent = message;
      this._messageContainerEl.className = "message-display";
      if (type === "error") {
        this._messageContainerEl.classList.add("error-message");
      } else if (type === "success") {
        this._messageContainerEl.classList.add("success-message");
      } else {
        this._messageContainerEl.classList.add("info-message");
      }
      this._messageContainerEl.style.display = "block";
    }
  }

  displayError(message) {
    this.displayMessage(message, "error");
  }

  displayInfoMessage(message) {
    this.displayMessage(message, "info");
  }

  clearMessage() {
    if (this._messageContainerEl) {
      this._messageContainerEl.textContent = "";
      this._messageContainerEl.style.display = "none";
      this._messageContainerEl.className = "message-display";
    }
  }

  renderStoryToDOM(story) {
    if (this._storyContentContainerEl) {
      this._storyContentContainerEl.innerHTML =
        createStoryDetailContentTemplate(story);
      this._mapContainerEl = this._storyContentContainerEl.querySelector(
        "#map-container-detail"
      );
    }
  }

  initializeAndShowMap(story) {
    if (!this._mapContainerEl || typeof L === "undefined") {
      if (this._mapContainerEl)
        this._mapContainerEl.innerHTML = "<p>Gagal memuat library peta.</p>";
      return;
    }
    if (!story || story.lat == null || story.lon == null) {
      this.hideMapDisplay();
      return;
    }
    this._mapContainerEl.innerHTML = "";
    this._mapContainerEl.style.display = "block";
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
    try {
      this._map = L.map(this._mapContainerEl, {
        layers: [
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
            maxZoom: 19,
          }),
        ],
      }).setView([story.lat, story.lon], 15);
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
        "Peta Jalan": this._map.hasLayer(esriSatelliteTile)
          ? null
          : L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
        "Satelit (Label)": satelliteWithLabelsGroup,
      };
      if (!this._map.getPane("labels")) {
        this._map.createPane("labels");
        this._map.getPane("labels").style.zIndex = 350;
        this._map.getPane("labels").style.pointerEvents = "none";
      }
      L.control
        .layers(baseLayers, null, { position: "topright" })
        .addTo(this._map);
      L.marker([story.lat, story.lon])
        .addTo(this._map)
        .bindPopup(`<b>${story.name}</b><br>Lokasi cerita ini.`);
    } catch (mapError) {
      if (this._mapContainerEl)
        this._mapContainerEl.innerHTML =
          "<p>Terjadi kesalahan saat menampilkan peta lokasi.</p>";
    }
  }

  hideMapDisplay() {
    if (!this._mapContainerEl) {
      this._mapContainerEl = document.querySelector("#map-container-detail");
    }
    if (this._mapContainerEl) {
      this._mapContainerEl.style.display = "none";
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

export default DetailPage;
