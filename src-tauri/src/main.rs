// ARCHIVO: src-tauri/src/main.rs

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Aquí conectamos el ejecutable con la librería que creaste
    notas_axel_lib::run();
}