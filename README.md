# 📝 Mis Notas Pro

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Tauri](https://img.shields.io/badge/Tauri-v2-orange) ![Rust](https://img.shields.io/badge/Backend-Rust-black) ![License](https://img.shields.io/badge/License-MIT-green)

**Mis Notas Pro** es una aplicación de gestión de notas multiplataforma, ultraligera y centrada en la privacidad. Desarrollada con **Tauri v2**, combina la potencia y seguridad de **Rust** en el backend con la flexibilidad de **JavaScript Vanilla** en el frontend.

Diseñada para ofrecer una experiencia nativa fluida tanto en **Escritorio (Windows)** como en **Dispositivos Móviles (Android)**.

---

## 🚀 Características Principales

* **⚡ Rendimiento Nativo:** Gracias a Rust y Tauri, la app consume mínimos recursos (RAM/CPU) comparada con alternativas basadas en Electron.
* **📱 Diseño Responsivo & Híbrido:**
    * **PC:** Vista de pantalla dividida (Barra lateral + Editor).
    * **Móvil:** Navegación fluida tipo App Nativa (Dashboard de carpetas -> Editor con botón de retorno).
* **🔒 Privacidad Total:** Tus datos te pertenecen. Las notas se guardan localmente en tu dispositivo (sin servidores ni nubes de terceros).
    * *Android:* Almacenamiento seguro en carpeta privada (`user_notes`).
* **🎨 Personalización:**
    * Modo Oscuro / Modo Claro.
    * Tipografías ajustables (Sistema, Clásica, Código).
    * Tamaño de fuente dinámico.
* **✍️ Editor Enriquecido:**
    * Formato de texto (Negrita, Cursiva, Subrayado, Títulos).
    * Listas desordenadas.
    * Resaltado de colores con lógica de contraste inteligente.
    * Inserción de imágenes (PC) y soporte visual.
    * Exportación a PDF (PC).

---

## 🛠️ Tecnologías Utilizadas

Este proyecto demuestra la capacidad de crear aplicaciones modernas utilizando tecnologías web estándares compiladas a binarios nativos.

| Área | Tecnología |
| :--- | :--- |
| **Core / Build System** | [Tauri v2](https://tauri.app/) |
| **Backend / Sistema** | [Rust](https://www.rust-lang.org/) |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla ES6+) |
| **Build Tool** | Vite |
| **Móvil** | Android Studio (SDK/NDK) |

---

## 📸 Capturas de Pantalla

*(Aquí puedes subir tus capturas luego. Por ejemplo:)*

| Escritorio (Windows) | Móvil (Android) |
| :---: | :---: |
| *Vista de edición con modo oscuro* | *Vista de dashboard y teclado optimizado* |

---

## 📦 Instalación

### Windows
Descarga el instalador `.msi` desde la sección de [Releases](https://github.com/AxelvillaInacap/MisNotasProApp/releases).
1. Ejecuta el archivo `Mis Notas Pro_1.0.0_x64_en-US.msi`.
2. Sigue las instrucciones del instalador.

### Android
Descarga el archivo `.apk` e instálalo en tu dispositivo.
*(Nota: Al ser una app no listada en Play Store, debes permitir la instalación de orígenes desconocidos).*

---

## 💻 Desarrollo Local

Si quieres clonar y mejorar este proyecto:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/AxelvillaInacap/MisNotasProApp.git](https://github.com/AxelvillaInacap/MisNotasProApp.git)
    cd MisNotasProApp
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo (PC):**
    ```bash
    npm run tauri dev
    ```

4.  **Compilar para Android:**
    ```bash
    npm run tauri android build -- --debug
    ```

---

## 👤 Autor

Desarrollado por **Axel**.
Estudiante de Ingeniería en Informática - INACAP.

---