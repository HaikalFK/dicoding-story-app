import AddStoryPagePresenter from "./add-story-page-presenter.js";
import { createAddStoryPageTemplate } from "./templates/add-story-template.js";

class AddStoryPage {
  constructor(models) {
    this._presenter = new AddStoryPagePresenter(this, models);

    this._photoFileInternal = null;
    this._latitudeInternal = null;
    this._longitudeInternal = null;

    this._videoStream = null;
    this._map = null;
    this._mapMarker = null;
    this._isMapExpanded = false;

    this._elements = {};
    this._boundCleanup = this.cleanup.bind(this);
  }

  async render() {
    return createAddStoryPageTemplate();
  }

  async afterRender() {
    this._elements = this._getElements();
    if (!this._elements.form) {
      return;
    }
    this._setupEventListeners();
    await this._presenter.onViewReady();
    window.addEventListener("hashchange", this._boundCleanup, { once: true });
  }

  _getElements() {
    return {
      form: document.querySelector("#add-story-form"),
      descriptionInput: document.querySelector("#description-input"),
      photoInput: document.querySelector("#photo-input"),
      startCameraButton: document.querySelector("#start-camera-button"),
      cameraVideo: document.querySelector("#camera-video"),
      capturePhotoButton: document.querySelector("#capture-photo-button"),
      photoPreview: document.querySelector("#photo-preview"),
      mapUiWrapper: document.querySelector("#map-ui-wrapper"),
      mapContainer: document.querySelector("#map-container-add"),
      toggleMapSizeButton: document.querySelector("#toggle-map-size-button"),
      latitudeInput: document.querySelector("#latitude-input"),
      longitudeInput: document.querySelector("#longitude-input"),
      getCurrentLocationButton: document.querySelector(
        "#get-current-location-button"
      ),
      messageContainer: document.querySelector("#message-container-add"),
    };
  }

  _setupEventListeners() {
    this._elements.form.addEventListener("submit", (event) => {
      event.preventDefault();
      const description = this._elements.descriptionInput.value;
      this._presenter.handleSubmitStory(
        description,
        this._photoFileInternal,
        this._latitudeInternal,
        this._longitudeInternal
      );
    });

    this._elements.startCameraButton.addEventListener("click", () =>
      this._presenter.handleStartCameraRequest()
    );
    this._elements.capturePhotoButton.addEventListener("click", () =>
      this._presenter.handleCapturePhotoRequest()
    );

    this._elements.photoInput.addEventListener("change", (event) => {
      const file = event.target.files ? event.target.files[0] : null;
      if (file) {
        this._presenter.handlePhotoSelectedOrCaptured(file);
      } else {
        this._resetPhotoUIAndInternalState();
      }
    });
    this._elements.getCurrentLocationButton.addEventListener("click", () =>
      this._presenter.handleGetCurrentLocationRequest()
    );
    this._elements.toggleMapSizeButton.addEventListener("click", () =>
      this._presenter.handleToggleMapSizeRequest()
    );
  }

  displayMessage(message, isError = false, isProcessing = false) {
    if (this._elements.messageContainer) {
      this._elements.messageContainer.textContent = message;
      let messageClass = "message-display";
      if (isError) {
        messageClass += " error-message";
      } else if (!isProcessing) {
        messageClass += " success-message";
      }
      this._elements.messageContainer.className = messageClass;
      this._elements.messageContainer.style.display = "block";
    }
  }

  clearMessage() {
    if (this._elements.messageContainer) {
      this._elements.messageContainer.textContent = "";
      this._elements.messageContainer.style.display = "none";
      this._elements.messageContainer.className = "message-display";
    }
  }

  setSubmitButtonDisabled(isDisabled) {
    const submitButton = this._elements.form.querySelector(
      'button[type="submit"]'
    );
    if (submitButton) submitButton.disabled = isDisabled;
  }

  updateLocationInputsUI(lat, lon) {
    this._latitudeInternal = lat;
    this._longitudeInternal = lon;
    if (this._elements.latitudeInput)
      this._elements.latitudeInput.value = lat !== null ? lat.toFixed(5) : "";
    if (this._elements.longitudeInput)
      this._elements.longitudeInput.value = lon !== null ? lon.toFixed(5) : "";
  }

  setMapView(lat, lon, zoomLevel) {
    if (this._map) {
      this._map.setView([lat, lon], zoomLevel);
    }
  }

  updateMapMarkerAndPopup(lat, lon, popupMessage) {
    if (!this._map) return;
    if (this._mapMarker) {
      this._mapMarker.setLatLng([lat, lon]);
    } else {
      this._mapMarker = L.marker([lat, lon]).addTo(this._map);
    }
    this._mapMarker.bindPopup(popupMessage).openPopup();
  }

  showPhotoPreviewUI(photoFile) {
    this._photoFileInternal = photoFile;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this._elements.photoPreview) {
        this._elements.photoPreview.src = e.target.result;
        this._elements.photoPreview.style.display = "block";
      }
      if (this._elements.cameraVideo)
        this._elements.cameraVideo.style.display = "none";
      if (this._elements.capturePhotoButton)
        this._elements.capturePhotoButton.textContent = "Ambil Ulang Foto";
      if (this._elements.startCameraButton)
        this._elements.startCameraButton.textContent = "Ganti Foto (Kamera)";
    };
    reader.onerror = () => {
      this.displayMessage("Gagal menampilkan preview foto.", true);
    };
    reader.readAsDataURL(photoFile);
  }

  _resetPhotoUIAndInternalState() {
    this._photoFileInternal = null;
    if (this._elements.photoInput) this._elements.photoInput.value = "";
    if (this._elements.photoPreview) {
      this._elements.photoPreview.src = "#";
      this._elements.photoPreview.style.display = "none";
    }
    if (this._elements.cameraVideo)
      this._elements.cameraVideo.style.display = "none";
    if (this._elements.capturePhotoButton) {
      this._elements.capturePhotoButton.textContent = "Ambil Foto";
      this._elements.capturePhotoButton.style.display = "none";
    }
    if (this._elements.startCameraButton)
      this._elements.startCameraButton.textContent = "Gunakan Kamera";
    this.stopCameraStreamIfActive();
  }

  resetFormAndInternalState() {
    this._resetPhotoUIAndInternalState();
    if (this._elements.descriptionInput)
      this._elements.descriptionInput.value = "";
    this.updateLocationInputsUI(null, null);
    if (this._mapMarker && this._map) {
      this._map.removeLayer(this._mapMarker);
      this._mapMarker = null;
    }
    if (this._map) this._map.setView([-6.2088, 106.8456], 10);
  }

  navigateToHome() {
    window.location.hash = "#/";
  }
  navigateToLogin() {
    window.location.hash = "#/login";
  }

  async activateCamera() {
    this._resetPhotoUIAndInternalState();
    if (
      !this._elements.cameraVideo ||
      !this._elements.capturePhotoButton ||
      !this._elements.startCameraButton
    )
      return;

    this._elements.cameraVideo.style.display = "block";
    this._elements.capturePhotoButton.style.display = "block";

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        this._videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        this._elements.cameraVideo.srcObject = this._videoStream;
        this._elements.startCameraButton.textContent = "Kamera Aktif";
      } catch (error) {
        this._videoStream = null;
        this.displayMessage(
          "Kamera tidak bisa diakses. Pastikan izin telah diberikan.",
          true
        );
        this._elements.cameraVideo.style.display = "none";
        this._elements.capturePhotoButton.style.display = "none";
        this._elements.startCameraButton.textContent = "Coba Lagi Kamera";
      }
    } else {
      this.displayMessage("Fitur kamera tidak didukung browser ini.", true);
    }
  }

  triggerPhotoCapture() {
    if (!this._videoStream) {
      this.displayMessage("Kamera belum aktif untuk mengambil foto.", true);
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = this._elements.cameraVideo.videoWidth;
    canvas.height = this._elements.cameraVideo.videoHeight;
    canvas
      .getContext("2d")
      .drawImage(this._elements.cameraVideo, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        const photoFile = new File([blob], `story-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        this._presenter.handlePhotoSelectedOrCaptured(photoFile);
      },
      "image/jpeg",
      0.9
    );
  }

  stopCameraStreamIfActive() {
    if (this._videoStream) {
      this._videoStream.getTracks().forEach((track) => track.stop());
      this._videoStream = null;
      if (this._elements.cameraVideo)
        this._elements.cameraVideo.srcObject = null;
      if (this._elements.startCameraButton)
        this._elements.startCameraButton.textContent = "Gunakan Kamera";
    }
  }

  async fetchCurrentGeolocationFromPlatform() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (geoError) => {
            let errorMessage = "Gagal mendapatkan lokasi: ";
            switch (geoError.code) {
              case geoError.PERMISSION_DENIED:
                errorMessage += "Anda menolak izin lokasi.";
                break;
              case geoError.POSITION_UNAVAILABLE:
                errorMessage += "Info lokasi tidak tersedia.";
                break;
              case geoError.TIMEOUT:
                errorMessage += "Permintaan lokasi timeout.";
                break;
              default:
                errorMessage += "Kesalahan tidak diketahui.";
                break;
            }
            reject(new Error(errorMessage));
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        reject(new Error("Geolocation tidak didukung browser ini."));
      }
    });
  }

  initializeMapForAdding() {
    if (!this._elements.mapContainer || typeof L === "undefined") {
      if (this._elements.mapContainer)
        this._elements.mapContainer.innerHTML =
          "<p>Gagal memuat library peta.</p>";
      return;
    }
    this._elements.mapContainer.innerHTML = "";
    const initialView = [-6.2088, 106.8456];

    if (this._map) {
      this._map.remove();
      this._map = null;
    }

    const osmTile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    );

    const esriSatelliteTile = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 18,
      }
    );

    const cartoLabelsTile = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        pane: "labels",
        maxZoom: 19,
      }
    );

    const satelliteWithLabelsGroup = L.layerGroup([
      esriSatelliteTile,
      cartoLabelsTile,
    ]);

    const baseLayers = {
      "Peta Jalan": osmTile,
      "Citra Satelit": satelliteWithLabelsGroup,
    };

    try {
      this._map = L.map(this._elements.mapContainer, {
        layers: [osmTile],
      }).setView(initialView, 10);

      if (!this._map.getPane("labels")) {
        this._map.createPane("labels");
        this._map.getPane("labels").style.zIndex = 350;
        this._map.getPane("labels").style.pointerEvents = "none";
      }

      L.control
        .layers(baseLayers, null, { position: "bottomright" })
        .addTo(this._map);

      this._map.on("click", (e) => {
        this._presenter.handleMapClick(e.latlng.lat, e.latlng.lng);
      });

      if (!this._mapMarker) {
        L.popup()
          .setLatLng(initialView)
          .setContent("Klik di peta untuk memilih lokasi cerita")
          .openOn(this._map);
      }
    } catch (mapError) {
      if (this._elements.mapContainer)
        this._elements.mapContainer.innerHTML =
          "<p>Gagal memuat peta untuk pemilihan lokasi.</p>";
    }
  }

  toggleMapExpansionUI() {
    this._isMapExpanded = !this._isMapExpanded;
    if (this._isMapExpanded) {
      this._elements.mapUiWrapper.classList.add("map-ui-wrapper-expanded");
      document.body.classList.add("map-fullscreen-active");
    } else {
      this._elements.mapUiWrapper.classList.remove("map-ui-wrapper-expanded");
      document.body.classList.remove("map-fullscreen-active");
    }
    setTimeout(() => {
      if (this._map) this._map.invalidateSize();
    }, 100);
    return this._isMapExpanded;
  }

  updateToggleMapButtonTextUI(isExpanded) {
    if (this._elements.toggleMapSizeButton) {
      this._elements.toggleMapSizeButton.innerHTML = isExpanded
        ? "Kecilkan Peta"
        : "Perbesar Peta";
    }
  }

  getMapExpansionState() {
    return this._isMapExpanded;
  }

  collapseMapUI() {
    if (this._isMapExpanded) {
      this._elements.mapUiWrapper.classList.remove("map-ui-wrapper-expanded");
      document.body.classList.remove("map-fullscreen-active");
      this._isMapExpanded = false;
      setTimeout(() => {
        if (this._map) this._map.invalidateSize();
      }, 100);
    }
  }

  async cleanup() {
    if (
      this._presenter &&
      typeof this._presenter.handleCleanupRequest === "function"
    ) {
      await this._presenter.handleCleanupRequest();
    }
    window.removeEventListener("hashchange", this._boundCleanup);
  }
}
export default AddStoryPage;
