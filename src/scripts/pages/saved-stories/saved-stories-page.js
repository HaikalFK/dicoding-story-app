import SavedStoriesPagePresenter from "./saved-stories-page-presenter.js";
import {
  createSavedStoriesPageTemplate,
  createSavedStoryItemTemplate,
} from "./templates/saved-stories-template.js";

class SavedStoriesPage {
  constructor(models) {
    this._presenter = new SavedStoriesPagePresenter(this, models);

    this._storyListContainerEl = null;
    this._loadingIndicatorEl = null;
    this._messageContainerEl = null;
  }

  async render() {
    return createSavedStoriesPageTemplate();
  }

  async afterRender() {
    this._storyListContainerEl = document.querySelector(
      "#saved-story-list-container"
    );
    this._loadingIndicatorEl = document.querySelector(
      "#loading-indicator-saved"
    );
    this._messageContainerEl = document.querySelector("#message-display-saved");

    if (
      !this._storyListContainerEl ||
      !this._loadingIndicatorEl ||
      !this._messageContainerEl
    ) {
      const mainContent = document.querySelector("#main-content");
      if (mainContent)
        mainContent.innerHTML =
          "<p>Error: Gagal memuat komponen UI halaman cerita tersimpan.</p>";
      return;
    }

    await this._presenter.onViewReady();
  }

  showLoading(isLoading) {
    if (this._loadingIndicatorEl) {
      this._loadingIndicatorEl.style.display = isLoading ? "block" : "none";
      if (isLoading && this._storyListContainerEl)
        this._storyListContainerEl.innerHTML = "";
    }
  }

  displayMessage(message, isError = false, isProcessing = false) {
    if (this._messageContainerEl) {
      this._messageContainerEl.textContent = message;
      let messageClass = "message-display";
      if (isError) messageClass += " error-message";
      else if (!isProcessing) messageClass += " success-message";
      else messageClass += " info-message";
      this._messageContainerEl.className = messageClass;
      this._messageContainerEl.style.display = "block";
    }
  }

  clearMessage() {
    if (this._messageContainerEl) {
      this._messageContainerEl.textContent = "";
      this._messageContainerEl.style.display = "none";
      this._messageContainerEl.className = "message-display";
    }
  }

  clearSavedStoryListAndMessages() {
    if (this._storyListContainerEl) this._storyListContainerEl.innerHTML = "";
    this.clearMessage();
    if (
      this._loadingIndicatorEl &&
      (!this._storyListContainerEl || !this._storyListContainerEl.innerHTML)
    ) {
      this._loadingIndicatorEl.style.display = "block";
    }
  }

  renderSavedStoryList(stories) {
    if (!this._storyListContainerEl) return;
    this.clearMessage();
    this.showLoading(false);

    if (stories && stories.length > 0) {
      this._storyListContainerEl.innerHTML = "";
      const fragment = document.createDocumentFragment();
      stories.forEach((story) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = createSavedStoryItemTemplate(story).trim();
        if (tempDiv.firstChild) {
          const storyElement = tempDiv.firstChild;
          const deleteButton = storyElement.querySelector(
            ".btn-delete-saved-story"
          );
          if (deleteButton) {
            deleteButton.addEventListener("click", (event) => {
              event.stopPropagation();
              const storyId = event.target.closest("button").dataset.id;
              if (
                window.confirm(
                  `Anda yakin ingin menghapus cerita "${story.name}" dari daftar tersimpan?`
                )
              ) {
                this._presenter.handleDeleteStoryRequest(storyId);
              }
            });
          }
          fragment.appendChild(storyElement);
        }
      });
      this._storyListContainerEl.appendChild(fragment);
    } else {
      this.showNoSavedStoriesMessage();
    }
  }

  showNoSavedStoriesMessage() {
    if (this._storyListContainerEl) {
      this._storyListContainerEl.innerHTML =
        '<p style="text-align:center; padding: 20px;">Anda belum memiliki cerita yang disimpan.</p>';
    }
  }

  navigateToLogin() {
    window.location.hash = "#/login";
  }

  navigateToHome() {
    window.location.hash = "#/";
  }

  async cleanup() {}
}

export default SavedStoriesPage;
