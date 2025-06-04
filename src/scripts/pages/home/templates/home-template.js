export const createHomePageTemplate = () => `
  <section class="container home-page-content">
    <div class="page-header-controls-wrapper">
      <h2 class="header-page_title">Kumpulan Cerita Terbaru</h2>
      <div class="push-notification-controls-group">
        <button id="btn-subscribe-push" class="button button-success" style="display:none;">
          <i class="fas fa-bell"></i> Aktifkan Notifikasi
        </button>
        <button id="btn-unsubscribe-push" class="button button-danger" style="display:none;">
          <i class="fas fa-bell-slash"></i> Nonaktifkan Notifikasi
        </button>
        <p id="push-notification-status" style="font-size:0.8em; margin-top:5px;"></p>
      </div>
    </div>

    <div id="message-display-home" class="message-display" style="display:none; margin-bottom: 15px;"></div>

    <div id="story-list-container" class="story-list">
    </div>
    
    <p id="loading-indicator" style="display:none; text-align:center; margin:20px;">Memuat cerita...</p>
    
    <div class="map-section" style="margin-top: 30px;">
      <h3>Lokasi Cerita</h3>
      <div id="map-container-home" style="height: 450px; width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
         <p id="map-loading-indicator" style="text-align:center; padding-top: 20px; color:#777;">Memuat peta...</p>
      </div>
    </div>
  </section>
`;

export const createStoryItemTemplate = (story, isSaved = false) => `
  <article class="story-item" data-story-id="${story.id}">
    <img src="${story.photoUrl}" alt="Foto cerita dari ${
  story.name
}: ${story.description.substring(0, 30)}..." class="story-item__image">
    <div class="story-item__content">
      <h3 class="story-item__title">${story.name}</h3>
      <p class="story-item__date">Diposting pada: ${new Date(
        story.createdAt
      ).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
      <p class="story-item__description">${story.description}</p>
      ${
        story.lat && story.lon
          ? `<p class="story-item__location">Lokasi: (${story.lat.toFixed(
              3
            )}, ${story.lon.toFixed(3)})</p>`
          : ""
      }
      <div class="story-item__actions">
        <a href="#/stories/${
          story.id
        }" class="button button-primary button-sm story-item__detail-link">Lihat Detail</a>
        <button 
          type="button" 
          class="button button-sm btn-save-story ${
            isSaved ? "button-success" : "button-save-offline"
          }" 
          data-story-id="${story.id}"
          ${isSaved ? "disabled" : ""}
        >
          <i class="fas ${isSaved ? "fa-check-circle" : "fa-save"}"></i> ${
  isSaved ? "Tersimpan" : "Simpan"
}
        </button>
      </div>
    </div>
  </article>
`;
