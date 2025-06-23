// public/firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js",
); // O la versión más reciente compatible
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js",
);

// Tu configuración de Firebase (la misma que usarás en la app principal)
const firebaseConfig = {
  apiKey: "AIzaSyBQliOMUM8X7f-xVDrbr9IrwuN7l4j0Jag",
  authDomain: "frontend-tecnica.firebaseapp.com",
  projectId: "frontend-tecnica",
  storageBucket: "frontend-tecnica.firebasestorage.app",
  messagingSenderId: "939051227591",
  appId: "1:939051227591:web:3f039b7450b3f2c4f861e2",
  measurementId: "G-RZ0GXTWMSK", // Opcional
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const messaging = firebase.messaging();

// Opcional: Manejar mensajes en segundo plano (cuando la app no está en foco)
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification?.title || "Nueva Notificación";
  const notificationOptions = {
    body: payload.notification?.body || "Contenido del mensaje aquí.",
    icon: payload.notification?.icon || "/vite.svg", // Un ícono por defecto,
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
