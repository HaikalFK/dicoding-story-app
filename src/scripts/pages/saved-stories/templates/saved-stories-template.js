export const createSavedStoriesPageTemplate = () => `
  <section class="container saved-stories-page-content">
    <div class="page-header-controls-wrapper">
      <h2 class="header-page_title">Cerita Tersimpan Anda</h2>
    </div>
    <div id="message-display-saved" class="message-display" style="display:none; margin-bottom: 15px;"></div>
    <div id="saved-story-list-container" class="story-list">
      <p id="loading-indicator-saved">Memuat cerita tersimpan...</p>
      {/* Daftar cerita tersimpan akan dirender di sini */}
    </div>
  </section>
`;

export const createSavedStoryItemTemplate = (story) => `
  <article class="story-item saved-story-item">
    <img src="${story.photoUrl}" alt="Foto cerita dari ${
  story.name
}: ${story.description.substring(0, 30)}..." class="story-item__image">
    <div class="story-item__content">
      <h3 class="story-item__title">${story.name}</h3>
      <p class="story-item__date">Disimpan pada: ${new Date(
        story.savedAt || story.createdAt
      ).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })}</p>
      <p class="story-item__description">${story.description}</p>
      <div class="story-item__actions" style="margin-top: 10px; display: flex; gap: 10px;">
        <a href="#/stories/${
          story.id
        }" class="button button-primary button-sm">Lihat Detail</a>
        <button type="button" class="button button-danger button-sm btn-delete-saved-story" data-id="${
          story.id
        }">
          <i class="fas fa-trash-alt"></i> Hapus
        </button>
      </div>
    </div>
  </article>
`;
