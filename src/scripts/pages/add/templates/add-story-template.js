export const createAddStoryPageTemplate = () => `
  <div class="auth-page-container">
    <section class="add-story-page">
      <h2>Tambah Cerita Baru</h2>
      <form id="add-story-form" enctype="multipart/form-data">
        <div class="form-group">
          <label for="description-input">Deskripsi Cerita:</label>
          <textarea id="description-input" name="description" rows="4" required></textarea>
        </div>

        <div class="form-group">
          <label>Foto Cerita:</label>
          <button type="button" id="start-camera-button" class="button-secondary">Gunakan Kamera</button>
          <video id="camera-video" style="display:none; width:100%; max-width:400px; margin-top:10px; border:1px solid #ccc;" playsinline autoplay muted></video>
          <button type="button" id="capture-photo-button" style="display:none; margin-top:10px;" class="button-primary">Ambil Foto</button>
          <img id="photo-preview" src="#" alt="Preview foto cerita" style="display:none; max-width:100%; max-height:300px; margin-top:10px; border:1px solid #ccc;">
          <p style="font-size: 0.8em; margin-top: 15px; margin-bottom: 5px;">Atau unggah file manual:</p>
          <input type="file" id="photo-input" name="photo" accept="image/*">
          <p style="font-size: 0.75em; color: #666; margin-top: 5px;">Maksimum ukuran file: 1MB</p>
        </div>

        <div class="form-group">
          <label>Pilih Lokasi Cerita:</label>
          <p style="font-size: 0.8em; margin-bottom: 5px;">Klik di peta untuk memilih lokasi, atau gunakan lokasi Anda saat ini.</p>
          
          <div id="map-ui-wrapper" style="position: relative;">
            
            <div id="map-container-add" style="height: 300px; width: 100%; border:1px solid #ccc; background-color: #f0f0f0; margin-bottom: 10px;">
            </div>

            <button type="button" id="toggle-map-size-button" class="button-map-toggle">
              Perbesar Peta
            </button>

          </div>

          <div style="display:flex; gap:10px; margin-top:10px; margin-bottom: 15px;">
            <div style="flex:1;">
              <label for="latitude-input" style="font-size:0.8em">Latitude:</label>
              <input type="text" id="latitude-input" name="latitude" readonly style="background:#f0f0f0; font-size:0.9em;">
            </div>
            <div style="flex:1;">
              <label for="longitude-input" style="font-size:0.8em">Longitude:</label>
              <input type="text" id="longitude-input" name="longitude" readonly style="background:#f0f0f0; font-size:0.9em;">
            </div>
          </div>

          <button type="button" id="get-current-location-button" class="button-location" style="display: block; width:auto; margin: 0 auto;">
            Pilih Lokasi Saya Saat Ini
          </button>
        </div>
        <div id="message-container-add" style="display:none; margin-bottom:15px;"></div>
        <div class="form-actions">
          <a href="#/" class="button-secondary button-back">Kembali ke Beranda</a>
          <button type="submit" class="button-primary">Publikasikan Cerita</button>
        </div>
      </form>
    </section>
  </div>
`;
