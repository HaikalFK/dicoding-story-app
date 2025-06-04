import AuthAPI from "../data/api";
import AuthService from "./auth-service";

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushNotification = {
  async init() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn(
        "Push Notification or Service Worker not supported by this browser."
      );
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register(
        "./service-worker.js"
      );
      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  },

  async subscribeUser(registration) {
    if (!registration) {
      console.error(
        "Service Worker registration not available for subscription."
      );
      return null;
    }

    try {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== "granted") {
        console.warn("Notification permission not granted.");
        throw new Error("Izin notifikasi tidak diberikan.");
      }

      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        console.log("User IS already subscribed.");
        return subscription;
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log("User subscribed successfully:", subscription);

      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.error("Failed to subscribe the user: ", error);
      if (error.message === "Izin notifikasi tidak diberikan.") throw error;
      throw new Error("Gagal berlangganan notifikasi.");
    }
  },

  async sendSubscriptionToServer(subscription) {
    const token = await AuthService.getToken();
    if (!token) {
      console.error(
        "Cannot send subscription to server: User not authenticated."
      );
      throw new Error("Pengguna tidak terautentikasi.");
    }

    const subscriptionJson = subscription.toJSON();
    const payload = {
      endpoint: subscriptionJson.endpoint,
      keys: {
        p256dh: subscriptionJson.keys.p256dh,
        auth: subscriptionJson.keys.auth,
      },
    };

    console.log("Sending subscription to server:", payload);
    const response = await AuthAPI.subscribeNotification(token, payload);
    if (response.error) {
      console.error("Failed to send subscription to server:", response.message);
      throw new Error(
        response.message || "Gagal mengirim data langganan ke server."
      );
    }
    console.log("Subscription sent to server successfully.");
  },

  async unsubscribeUser(registration) {
    if (!registration) {
      console.error(
        "Service Worker registration not available for unsubscription."
      );
      return false;
    }
    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        const unsubscribed = await subscription.unsubscribe();
        if (unsubscribed) {
          console.log("User unsubscribed successfully from push service.");
          await this.sendUnsubscriptionToServer(endpoint);
          return true;
        }
      } else {
        console.log("User was not subscribed.");
        return true;
      }
    } catch (error) {
      console.error("Failed to unsubscribe user:", error);
      return false;
    }
    return false;
  },

  async sendUnsubscriptionToServer(endpoint) {
    const token = await AuthService.getToken();
    if (!token) {
      console.error(
        "Cannot send unsubscription to server: User not authenticated."
      );
      throw new Error("Pengguna tidak terautentikasi.");
    }

    console.log("Sending unsubscription (endpoint) to server:", endpoint);
    const response = await AuthAPI.unsubscribeNotification(token, { endpoint });
    if (response.error) {
      console.error(
        "Failed to send unsubscription to server:",
        response.message
      );
      throw new Error(
        response.message || "Gagal mengirim data berhenti langganan ke server."
      );
    }
    console.log("Unsubscription sent to server successfully.");
  },

  async getCurrentSubscription(registration) {
    if (!registration) return null;
    return registration.pushManager.getSubscription();
  },
};

export default PushNotification;
