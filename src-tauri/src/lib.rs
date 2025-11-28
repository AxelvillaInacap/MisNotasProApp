use std::fs;
use tauri::Manager;
use std::path::PathBuf;

// Lógica para Android: filtra carpetas basura usando "user_notes"
fn get_target_path(app: &tauri::AppHandle, subfolder: Option<String>) -> PathBuf {
    let mut path = app.path().app_data_dir().expect("Error al obtener ruta de datos");
    
    // Carpeta especial para que no se mezcle con cache de Android
    path.push("user_notes");

    if !path.exists() {
        let _ = std::fs::create_dir_all(&path);
    }
    
    if let Some(folder) = subfolder {
        if !folder.is_empty() { 
            path.push(folder);
        }
    }
    path
}

#[tauri::command]
fn create_folder(app: tauri::AppHandle, name: String) -> Result<(), String> {
    let mut path = get_target_path(&app, None);
    path.push(&name);
    if !path.exists() { fs::create_dir_all(&path).map_err(|e| e.to_string())?; }
    Ok(())
}

#[tauri::command]
fn rename_folder(app: tauri::AppHandle, old_name: String, new_name: String) -> Result<(), String> {
    let base_path = get_target_path(&app, None);
    let old_path = base_path.join(&old_name);
    let new_path = base_path.join(&new_name);
    if old_path.exists() { fs::rename(old_path, new_path).map_err(|e| e.to_string())?; }
    Ok(())
}

#[tauri::command]
fn delete_folder(app: tauri::AppHandle, name: String) -> Result<(), String> {
    let mut path = get_target_path(&app, None);
    path.push(&name);
    if path.exists() { fs::remove_dir_all(path).map_err(|e| e.to_string())?; }
    Ok(())
}

#[tauri::command]
fn get_folders(app: tauri::AppHandle) -> Result<Vec<String>, String> {
    let path = get_target_path(&app, None);
    if !path.exists() { fs::create_dir_all(&path).map_err(|e| e.to_string())?; }
    let mut folders = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                if entry.path().is_dir() {
                    if let Some(name) = entry.file_name().to_str() {
                        folders.push(name.to_string());
                    }
                }
            }
        }
    }
    Ok(folders)
}

#[tauri::command]
fn get_notes(app: tauri::AppHandle, subfolder: Option<String>) -> Result<Vec<String>, String> {
    let path = get_target_path(&app, subfolder);
    if !path.exists() { return Ok(Vec::new()); }
    let mut notes = Vec::new();
    if let Ok(entries) = fs::read_dir(path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let p = entry.path();
                if p.is_file() && p.extension().and_then(|s| s.to_str()) == Some("txt") {
                    if let Some(name) = p.file_stem().and_then(|s| s.to_str()) {
                        notes.push(name.to_string());
                    }
                }
            }
        }
    }
    Ok(notes)
}

#[tauri::command]
fn save_note(app: tauri::AppHandle, subfolder: Option<String>, title: String, content: String) -> Result<(), String> {
    let mut path = get_target_path(&app, subfolder);
    if !path.exists() { fs::create_dir_all(&path).map_err(|e| e.to_string())?; }
    let filename = format!("{}.txt", title.replace("/", "-"));
    path.push(filename);
    fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_note_content(app: tauri::AppHandle, subfolder: Option<String>, title: String) -> Result<String, String> {
    let mut path = get_target_path(&app, subfolder);
    path.push(format!("{}.txt", title));
    if path.exists() { fs::read_to_string(path).map_err(|e| e.to_string()) } else { Ok("".to_string()) }
}

#[tauri::command]
fn rename_note(app: tauri::AppHandle, subfolder: Option<String>, old_title: String, new_title: String) -> Result<(), String> {
    let path = get_target_path(&app, subfolder);
    let old_p = path.join(format!("{}.txt", old_title));
    let new_p = path.join(format!("{}.txt", new_title));
    if old_p.exists() { fs::rename(old_p, new_p).map_err(|e| e.to_string())?; }
    Ok(())
}

#[tauri::command]
fn delete_note(app: tauri::AppHandle, subfolder: Option<String>, title: String) -> Result<(), String> {
    let mut path = get_target_path(&app, subfolder);
    path.push(format!("{}.txt", title));
    if path.exists() { fs::remove_file(path).map_err(|e| e.to_string())?; }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_folder, rename_folder, delete_folder, get_folders,
            get_notes, save_note, load_note_content, rename_note, delete_note
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}