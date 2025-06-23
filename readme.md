# Prueba Técnica Frontend - Gestión de Posts en Tiempo Real

Esta aplicación es una implementación para una prueba técnica de un desarrollador Frontend Senior. Consiste en una interfaz para gestionar una lista de publicaciones, con funcionalidades en tiempo real, optimizaciones y notificaciones push.

## Tecnologías Utilizadas

- **Framework/Librería:** React.js (v18+)
- **Lenguaje:** TypeScript
- **Build Tool:** Vite
- **Estilos:** Tailwind CSS
- **Componentes UI:** Mantine
- **Manejo de Formularios:** React Hook Form
- **Validación de Esquemas:** Zod
- **Comunicación en Tiempo Real (Simulada):** Simulación de eventos WebSocket del lado del cliente.
- **Sincronización entre Pestañas:** BroadcastChannel API
- **Optimización:**
  - Lazy Loading con `React.lazy` y `Suspense`
  - Análisis de Bundle con `vite-bundle-visualizer` (integrado como `rollup-plugin-visualizer`)
- **Pruebas:** Vitest y React Testing Library
- **Notificaciones Push:** Firebase Cloud Messaging (FCM) y Service Worker
- **Iconos:** React Icons
- **Control de Versiones:** Git

## Características Implementadas

- **Gestión de Publicaciones (CRUD):**
  - Listado de publicaciones.
  - Creación de nuevas publicaciones a través de un modal.
  - Edición de publicaciones existentes (en modal o página dedicada con lazy loading).
  - Eliminación de publicaciones.
- **Filtrado:**
  - Filtrar publicaciones por autor.
  - Filtrar publicaciones por estado (ej. "draft", "published").
- **Validación de Formularios:**
  - Validación robusta en el formulario de creación/edición usando React Hook Form y Zod.
  - Mensajes de error claros para el usuario.
- **Notificaciones Toast:**
  - Notificaciones en la interfaz (usando Mantine Notifications) para confirmar acciones del usuario (crear, editar, eliminar) y para eventos recibidos.
- **Funcionalidad en Tiempo Real (Simulada):**
  - La aplicación simula la recepción de eventos WebSocket (`new-post`, `post-updated`) cuando se crean o actualizan posts.
  - La UI se actualiza en consecuencia para reflejar estos cambios "remotos".
- **Sincronización entre Pestañas:**
  - Los cambios realizados en una pestaña (crear, editar, eliminar post) se reflejan automáticamente en otras pestañas abiertas de la aplicación utilizando la BroadcastChannel API.
- **Optimización de Rendimiento:**
  - **Lazy Loading:** El componente del formulario de posts (`PostForm.tsx`) se carga de forma perezosa para reducir el tamaño del bundle inicial.
  - **Análisis de Bundle:** Se ha realizado un análisis del bundle para identificar posibles áreas de mejora.
- **Pruebas:**
  - Se han implementado pruebas unitarias/de integración para el componente `PostForm.tsx` utilizando Vitest y React Testing Library.
- **Notificaciones Push (Opcional Implementado):**
  - Integración con Firebase Cloud Messaging (FCM) para permitir notificaciones push en el navegador.
  - Solicitud de permiso al usuario.
  - Obtención y muestra del token FCM para pruebas.
  - Service Worker (`public/firebase-messaging-sw.js`) para manejar notificaciones en segundo plano.
  - Manejo de notificaciones en primer plano dentro de la aplicación.

## Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone URL_DE_TU_REPOSITORIO_AQUI
    ```
2.  **Navegar al directorio del proyecto:**
    ```bash
    cd nombre-del-directorio-del-proyecto
    ```
3.  **Instalar dependencias:**

    ```bash
    npm install
    ```

    _(Si usas `yarn`, reemplaza `npm install` con `yarn install`)_

    Crea un archivo `.env` en la raíz del proyecto copiando `.env.example` (si lo proporcionaste) y completa tus credenciales de Firebase:

    ```bash
    cp .env.example .env
    # Luego edita .env con tus valores
    ```

    _Nota: Para `public/firebase-messaging-sw.js`, la configuración de Firebase está directamente en el archivo para esta demostración._

## Ejecución

### Desarrollo

Para iniciar la aplicación en modo de desarrollo (con Hot Module Replacement):

```bash
npm run dev
```

La aplicación estará disponible en http://localhost:5173 (o el puerto que Vite asigne).

### Build de Producción

Para compilar la aplicación para producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta dist/. Este comando también generará el reporte stats.html del análisis del bundle en la raíz del proyecto.

### Ejecutar Pruebas

Para ejecutar la suite de pruebas:

```bash
npm run test
```

## Optimización Aplicada

### Lazy Loading

El componente PostForm.tsx (utilizado en el modal de creación/edición de posts) se carga de forma perezosa utilizando React.lazy y Suspense. Esto significa que el código de este formulario no se incluye en el bundle inicial de JavaScript, reduciendo su tamaño y mejorando el tiempo de carga inicial percibido de la página principal. El chunk de PostForm.tsx se descarga y parsea solo cuando el usuario intenta abrir el modal por primera vez.

### Análisis del Bundle (stats.html)

Se utilizó rollup-plugin-visualizer (configurado en vite.config.ts) para generar un reporte interactivo del bundle de producción (stats.html), que se crea al ejecutar npm run build.

### Notas Adicionales

1. **Simulación de WebSocket:**

La funcionalidad de WebSocket (eventos `new-post`, `post-updated`) está completamente simulada en el lado del cliente, dentro de `src/services/socketService.ts`. El archivo `postService.ts` utiliza estas simulaciones al crear o actualizar publicaciones, eliminando la necesidad de un backend externo para esta prueba.

2. **Notificaciones Push (FCM):**

Para probar las notificaciones push:

- Haz clic en el botón **"Activar Notificaciones Push"** en la aplicación y acepta el permiso del navegador.
- El token FCM del dispositivo se mostrará en la consola del navegador. Cópialo.
- Ingresa a tu proyecto en la **Consola de Firebase** → **Participación (Engage)** → **Cloud Messaging**.
- Crea una nueva notificación o envía un mensaje de prueba, y en la sección "Enviar a un token de registro FCM específico", pega el token copiado.

Comportamiento esperado:

- Si la app está en primer plano, recibirás una notificación dentro de la app (usando Mantine).
- Si la app está en segundo plano o cerrada (pero el navegador sigue abierto), el Service Worker (`public/firebase-messaging-sw.js`) mostrará una notificación del sistema.

**Importante:** Asegúrate de haber configurado correctamente tu `firebaseConfig` en `src/services/firebaseService.ts` y `public/firebase-messaging-sw.js`, así como tu `vapidKey` en `firebaseService.ts`.
