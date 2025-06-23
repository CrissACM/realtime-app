import { notifications } from "@mantine/notifications";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBQliOMUM8X7f-xVDrbr9IrwuN7l4j0Jag",
  authDomain: "frontend-tecnica.firebaseapp.com",
  projectId: "frontend-tecnica",
  storageBucket: "frontend-tecnica.firebasestorage.app",
  messagingSenderId: "939051227591",
  appId: "1:939051227591:web:3f039b7450b3f2c4f861e2",
  measurementId: "G-RZ0GXTWMSK",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      const vapidKey =
        "BG1JNVYDrCo3eFkDz16XWsrd06lFjkVJ8Ph03UpoD-7JF63ihOMyekuZn53tSrn4BGig19_IIE6zR029pJN69d8";

      if (!vapidKey) {
        console.error(
          "VAPID key is not set. Please add it to firebaseService.ts",
        );
        notifications.show({
          title: "Error de Configuración",
          message: "Falta la clave VAPID para notificaciones push.",
          color: "red",
        });
        return null;
      }

      const currentToken = await getToken(messaging, { vapidKey: vapidKey });
      if (currentToken) {
        console.log("FCM Token:", currentToken);

        return currentToken;
      } else {
        console.log(
          "No registration token available. Request permission to generate one.",
        );
        return null;
      }
    } else {
      console.log("Unable to get permission to notify.");
      return null;
    }
  } catch (error) {
    console.error(
      "An error occurred while requesting permission or getting token:",
      error,
    );

    notifications.show({
      title: "Error de Notificación",
      message: "No se pudo obtener el token para notificaciones.",
      color: "red",
    });
    return null;
  }
};

try {
  onMessage(messaging, (payload) => {
    console.log("Message received in foreground: ", payload);
    notifications.show({
      title: payload.notification?.title || "Nuevo Mensaje",
      message: payload.notification?.body || "Tienes un nuevo mensaje.",
      color: "blue",
      autoClose: 7000,
    });
  });
} catch (error) {
  console.error("Error setting up onMessage listener: ", error);
}
