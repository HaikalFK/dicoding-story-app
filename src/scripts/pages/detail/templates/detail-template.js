export const createDetailPageTemplate = () => `
  <section class="container detail-page-container">
    <p id="detail-loading-indicator" style="text-align:center;">Memuat detail cerita...</p>
    <div id="message-display-detail" class="message-display" style="display:none; margin-bottom: 15px;"></div>
    <div id="story-detail-content-container">
    </div>
  </section>
`;

export const createStoryDetailContentTemplate = (story) => {
  if (!story) return "<p>Data cerita tidak tersedia.</p>";

  return `
    <article class="story-detail">
      <h2 class="story-detail__title">Cerita oleh: ${story.name}</h2>
      <img src="${story.photoUrl}" alt="Foto detail cerita oleh ${
    story.name
  }: ${story.description.substring(0, 50)}..." class="story-detail__image">
      <div class="story-detail__meta">
        <p>Diposting pada: 
          <time datetime="${story.createdAt}">
            ${new Date(story.createdAt).toLocaleDateString("id-ID", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </p>
        ${
          story.lat && story.lon
            ? `<p>Lokasi: (${story.lat.toFixed(3)}, ${story.lon.toFixed(
                3
              )})</p>`
            : ""
        }
      </div>
      <div class="story-detail__description">
        <h3>Deskripsi:</h3>
        <p>${story.description.replace(/\n/g, "<br>")}</p>
      </div>
      <div id="map-container-detail" style="height: 300px; margin-top: 20px; display: ${
        story.lat && story.lon ? "block" : "none"
      }; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      </div>
      <a href="#/" class="button button-secondary" style="margin-top: 20px;">Kembali ke Beranda</a>
    </article>
  `;
};
