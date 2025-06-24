importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyBQliOMUM8X7f-xVDrbr9IrwuN7l4j0Jag",
  authDomain: "frontend-tecnica.firebaseapp.com",
  projectId: "frontend-tecnica",
  storageBucket: "frontend-tecnica.firebasestorage.app",
  messagingSenderId: "939051227591",
  appId: "1:939051227591:web:3f039b7450b3f2c4f861e2",
  measurementId: "G-RZ0GXTWMSK",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );

  const notificationTitle = payload.notification?.title || "Nueva Notificación";
  const notificationOptions = {
    body: payload.notification?.body || "Tienes una nueva notificación",
    icon: payload.notification?.icon || "/vite.svg",
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});
