const DB_NAME = "dicoding-story-app-db";
const DB_VERSION = 1;
const OBJECT_STORE_STORIES = "stories";

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error(`Gagal membuka database: ${event.target.errorCode}`));
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE_STORIES)) {
        db.createObjectStore(OBJECT_STORE_STORIES, {
          keyPath: "id",
        });
      }
    };
  });
};

const putStory = async (story) => {
  if (!story || !story.id) {
    return Promise.reject(
      new Error("Objek cerita atau ID cerita tidak valid.")
    );
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_STORIES], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_STORIES);
    const request = store.put(story);

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(new Error(`Gagal menyimpan cerita: ${event.target.error.name}`));
    };
  });
};

const putAllStories = async (stories) => {
  if (!Array.isArray(stories)) {
    return Promise.reject(new Error("Input harus berupa array cerita."));
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_STORIES], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_STORIES);
    let completedOperations = 0;

    if (stories.length === 0) {
      resolve();
      return;
    }

    stories.forEach((story) => {
      if (story && story.id) {
        const request = store.put(story);
        request.onsuccess = () => {
          completedOperations++;
          if (completedOperations === stories.length) {
            resolve();
          }
        };
        request.onerror = (event) => {
          console.error(
            `Gagal menyimpan cerita dengan ID ${story.id} ke IDB:`,
            event.target.error
          );
          completedOperations++;
          if (completedOperations === stories.length) {
            resolve();
          }
        };
      } else {
        completedOperations++;
        if (completedOperations === stories.length) {
          resolve();
        }
      }
    });

    transaction.onerror = (event) => {
      reject(
        new Error(
          `Transaksi gagal saat menyimpan semua cerita: ${event.target.error.name}`
        )
      );
    };
  });
};

const getAllStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_STORIES], "readonly");
    const store = transaction.objectStore(OBJECT_STORE_STORIES);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(
        new Error(`Gagal mengambil semua cerita: ${event.target.error.name}`)
      );
    };
  });
};

const getStoryById = async (id) => {
  if (!id) {
    return Promise.reject(new Error("ID cerita tidak valid."));
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_STORIES], "readonly");
    const store = transaction.objectStore(OBJECT_STORE_STORIES);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      reject(new Error(`Gagal mengambil cerita: ${event.target.error.name}`));
    };
  });
};

const deleteStory = async (id) => {
  if (!id) {
    return Promise.reject(new Error("ID cerita tidak valid."));
  }
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_STORIES], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_STORIES);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      reject(new Error(`Gagal menghapus cerita: ${event.target.error.name}`));
    };
  });
};

const deleteAllStories = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([OBJECT_STORE_STORIES], "readwrite");
    const store = transaction.objectStore(OBJECT_STORE_STORIES);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      reject(
        new Error(`Gagal menghapus semua cerita: ${event.target.error.name}`)
      );
    };
  });
};

export {
  openDB,
  putStory,
  putAllStories,
  getAllStories,
  getStoryById,
  deleteStory,
  deleteAllStories,
};
