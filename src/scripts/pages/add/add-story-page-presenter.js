class AddStoryPagePresenter {
  constructor(view, models) {
    this._view = view;
    this._authAPI = models.authAPI;
    this._authService = models.authService;
    this._currentPhotoFile = null;
    this._currentLatitude = null;
    this._currentLongitude = null;
  }

  async onViewReady() {
    const isLoggedIn = await this._authService.isUserLoggedIn();
    if (!isLoggedIn) {
      this._view.navigateToLogin();
      return;
    }
    this._view.initializeMapForAdding();
  }

  async handleSubmitStory(description, photoFile, latitude, longitude) {
    this._view.clearMessage();

    if (!description.trim()) {
      this._view.displayMessage("Deskripsi cerita tidak boleh kosong.", true);
      return;
    }
    if (!photoFile) {
      this._view.displayMessage(
        "Foto cerita harus diambil atau diunggah.",
        true
      );
      return;
    }

    const MAX_FILE_SIZE_BYTES = 1000000;
    if (photoFile.size > MAX_FILE_SIZE_BYTES) {
      this._view.displayMessage(
        `Ukuran foto terlalu besar (${(photoFile.size / 1000000).toFixed(
          2
        )} MB). Maksimum 1MB.`,
        true
      );
      return;
    }

    this._view.displayMessage("Mengunggah cerita...", false, true);
    this._view.setSubmitButtonDisabled(true);

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photoFile);
    if (latitude !== null && longitude !== null) {
      formData.append("lat", parseFloat(latitude));
      formData.append("lon", parseFloat(longitude));
    }

    try {
      const token = await this._authService.getToken();
      const response = await this._authAPI.addNewStory(token, formData);

      if (response.error) {
        this._view.displayMessage(
          response.message || "Gagal menambahkan cerita.",
          true
        );
      } else {
        this._view.displayMessage(
          "Cerita berhasil ditambahkan! Anda akan diarahkan ke beranda.",
          false
        );
        this._view.resetFormAndInternalState();
        this._currentPhotoFile = null;
        this._currentLatitude = null;
        this._currentLongitude = null;
        setTimeout(() => {
          this._view.navigateToHome();
        }, 2500);
      }
    } catch (error) {
      this._view.displayMessage(
        error.message || "Terjadi kesalahan saat menambahkan cerita.",
        true
      );
    } finally {
      this._view.setSubmitButtonDisabled(false);
    }
  }

  async handleGetCurrentLocationRequest() {
    this._view.clearMessage();
    this._view.displayMessage("Mencari lokasi Anda saat ini...", false, true);
    try {
      const coords = await this._view.fetchCurrentGeolocationFromPlatform();
      this._currentLatitude = coords.latitude;
      this._currentLongitude = coords.longitude;
      this._view.updateLocationInputsUI(
        this._currentLatitude,
        this._currentLongitude
      );
      this._view.setMapView(this._currentLatitude, this._currentLongitude, 15);
      this._view.updateMapMarkerAndPopup(
        this._currentLatitude,
        this._currentLongitude,
        "Lokasi Anda saat ini"
      );
      this._view.displayMessage("Lokasi saat ini berhasil didapatkan.", false);
    } catch (error) {
      this._view.displayMessage(error.message, true);
    }
  }

  handleMapClick(lat, lon) {
    this._currentLatitude = lat;
    this._currentLongitude = lon;
    this._view.updateLocationInputsUI(lat, lon);
    this._view.updateMapMarkerAndPopup(lat, lon, "Lokasi cerita dipilih");
  }

  handleStartCameraRequest() {
    this._currentPhotoFile = null;
    this._view.activateCamera();
  }

  handleCapturePhotoRequest() {
    this._view.triggerPhotoCapture();
  }

  handlePhotoSelectedOrCaptured(photoFile) {
    this._currentPhotoFile = photoFile;
    this._view.showPhotoPreviewUI(photoFile);
    this._view.stopCameraStreamIfActive();
  }

  handleToggleMapSizeRequest() {
    const isNowExpanded = this._view.toggleMapExpansionUI();
    this._view.updateToggleMapButtonTextUI(isNowExpanded);
  }

  handleCleanupRequest() {
    this._view.stopCameraStreamIfActive();
    if (this._view.getMapExpansionState()) {
      this._view.collapseMapUI();
      this._view.updateToggleMapButtonTextUI(false);
    }
  }
}

export default AddStoryPagePresenter;
