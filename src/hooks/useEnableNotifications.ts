import { notifications } from "@mantine/notifications";
import { requestNotificationPermission } from "../services/firebaseService";

export function useEnableNotifications() {
  const handleEnableNotifications = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      notifications.show({
        title: "Notificaciones Activadas",
        message: "Estás listo para recibir notificaciones push.",
        color: "green",
      });
    } else {
      notifications.show({
        title: "Permiso Denegado",
        message: "No se pudo activar las notificaciones.",
        color: "red",
      });
    }
  };

  return { handleEnableNotifications };
}
