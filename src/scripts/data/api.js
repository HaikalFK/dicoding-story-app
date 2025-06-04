// src/scripts/data/api.js

import CONFIG from "../config"; // Pastikan path ini benar ke file config.js Anda

const AuthAPI = {
  async login({ email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get("content-type");
      if (
        response.ok &&
        contentType &&
        contentType.includes("application/json")
      ) {
        return response.json();
      }
      // Jika tidak ok atau bukan JSON, coba baca sebagai teks untuk info error
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("AuthAPI.login: Catch block error:", error);
      return {
        error: true,
        message:
          error.message || "Gagal terhubung ke server atau memproses respons.",
      };
    }
  },

  async register({ name, email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal terhubung ke server saat registrasi.",
      };
    }
  },

  async getAllStories(token, { page = 1, size = 10, location = 0 } = {}) {
    try {
      const queryParams = new URLSearchParams({ page, size, location });
      const response = await fetch(
        `${CONFIG.BASE_URL}/stories?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal mengambil data cerita.",
      };
    }
  },

  async getStoryDetail(token, id) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal mengambil detail cerita.",
      };
    }
  },

  async addNewStory(token, formData) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Content-Type tidak perlu di-set manual untuk FormData, browser akan menanganinya
        },
        body: formData,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal menambahkan cerita baru.",
      };
    }
  },

  async addNewStoryAsGuest(formData) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
        method: "POST",
        body: formData,
      });
      const responseJson = await response.json();
      return responseJson;
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal menambahkan cerita sebagai tamu.",
      };
    }
  },

  async subscribeNotification(token, subscriptionData) {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subscriptionData),
        }
      );
      // API mungkin mengembalikan status 200 atau 201 untuk sukses subscribe
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: "Gagal subscribe notifikasi, respons tidak valid.",
          }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal subscribe notifikasi.",
      };
    }
  },

  async unsubscribeNotification(token, { endpoint }) {
    try {
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint }),
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: "Gagal unsubscribe notifikasi, respons tidak valid.",
          }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }
      return response.json();
    } catch (error) {
      return {
        error: true,
        message: error.message || "Gagal unsubscribe notifikasi.",
      };
    }
  },
};

export default AuthAPI;
