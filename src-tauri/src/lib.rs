use chrono::Utc;
use serde::{Deserialize, Serialize};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, PhysicalPosition, PhysicalSize, WindowEvent,
};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct PipelineEnvelope {
    #[serde(rename = "type")]
    message_type: String,
    request_id: String,
    source: String,
    target: String,
    payload: serde_json::Value,
    timestamp: String,
}

impl PipelineEnvelope {
    fn pong(payload: serde_json::Value) -> Self {
        Self {
            message_type: "pong".to_string(),
            request_id: uuid::Uuid::new_v4().to_string(),
            source: "tauri".to_string(),
            target: "frontend".to_string(),
            payload,
            timestamp: Utc::now().to_rfc3339(),
        }
    }

    fn error(code: &str, message: String) -> Self {
        Self {
            message_type: "error".to_string(),
            request_id: uuid::Uuid::new_v4().to_string(),
            source: "tauri".to_string(),
            target: "frontend".to_string(),
            payload: serde_json::json!({
                "code": code,
                "message": message,
            }),
            timestamp: Utc::now().to_rfc3339(),
        }
    }
}

#[tauri::command]
fn window_minimize(window: tauri::WebviewWindow) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
fn window_toggle_maximize(window: tauri::WebviewWindow) -> Result<(), String> {
    let maximized = window.is_maximized().map_err(|e| e.to_string())?;

    if maximized {
        window.unmaximize().map_err(|e| e.to_string())
    } else {
        window.maximize().map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn window_hide_to_tray(window: tauri::WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
fn window_set_pinned(
    window: tauri::WebviewWindow,
    pinned: bool,
) -> Result<(), String> {
    window
        .set_always_on_top(pinned)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn window_dock(
    window: tauri::WebviewWindow,
    side: String,
) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "geen monitor".to_string())?;

    let pos = monitor.position();
    let size = monitor.size();
    let scale = monitor.scale_factor();

    let dock_w = (420.0 * scale).round() as u32;

    let x = if side == "right" {
        pos.x + size.width as i32 - dock_w as i32
    } else {
        pos.x
    };

    window
        .set_position(PhysicalPosition::new(x, pos.y))
        .map_err(|e| e.to_string())?;

    window
        .set_size(PhysicalSize::new(dock_w, size.height))
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn window_undock(window: tauri::WebviewWindow) -> Result<(), String> {
    window
        .set_size(tauri::LogicalSize::new(420.0, 720.0))
        .map_err(|e| e.to_string())?;

    window.center().map_err(|e| e.to_string())
}

#[tauri::command]
async fn ai_pipeline_ping() -> Result<serde_json::Value, String> {
    let response = match reqwest::get("http://127.0.0.1:8765/ping").await {
        Ok(res) => res,
        Err(e) => {
            return Ok(serde_json::to_value(PipelineEnvelope::error(
                "AI_PIPELINE_UNAVAILABLE",
                format!("AI pipeline niet bereikbaar: {e}"),
            ))
            .map_err(|err| format!("Kan error response serialiseren: {err}"))?);
        }
    };

    if !response.status().is_success() {
        return Ok(serde_json::to_value(PipelineEnvelope::error(
            "AI_PIPELINE_HTTP_ERROR",
            format!("AI pipeline gaf HTTP status {}", response.status()),
        ))
        .map_err(|err| format!("Kan error response serialiseren: {err}"))?);
    }

    let ai_payload = match response.json::<serde_json::Value>().await {
        Ok(payload) => payload,
        Err(e) => {
            return Ok(serde_json::to_value(PipelineEnvelope::error(
                "AI_PIPELINE_INVALID_RESPONSE",
                format!("Ongeldige response van AI pipeline: {e}"),
            ))
            .map_err(|err| format!("Kan error response serialiseren: {err}"))?);
        }
    };

    let envelope = PipelineEnvelope::pong(ai_payload);

    serde_json::to_value(envelope)
        .map_err(|e| format!("Kan response niet serialiseren: {e}"))
}

#[tauri::command]
async fn ai_pipeline_chat(message: String) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    let response = match client
        .post("http://127.0.0.1:8765/chat")
        .json(&serde_json::json!({ "message": message }))
        .send()
        .await
    {
        Ok(res) => res,
        Err(e) => {
            return Ok(serde_json::to_value(PipelineEnvelope::error(
                "AI_PIPELINE_UNAVAILABLE",
                format!("AI pipeline niet bereikbaar: {e}"),
            ))
            .map_err(|err| format!("Kan error response serialiseren: {err}"))?);
        }
    };

    if !response.status().is_success() {
        return Ok(serde_json::to_value(PipelineEnvelope::error(
            "AI_PIPELINE_HTTP_ERROR",
            format!("AI pipeline gaf HTTP status {}", response.status()),
        ))
        .map_err(|err| format!("Kan error response serialiseren: {err}"))?);
    }

    let ai_payload = match response.json::<serde_json::Value>().await {
        Ok(payload) => payload,
        Err(e) => {
            return Ok(serde_json::to_value(PipelineEnvelope::error(
                "AI_PIPELINE_INVALID_RESPONSE",
                format!("Ongeldige response van AI pipeline: {e}"),
            ))
            .map_err(|err| format!("Kan error response serialiseren: {err}"))?);
        }
    };

    Ok(ai_payload)
}

fn toggle_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        match window.is_visible() {
            Ok(true) => {
                let _ = window.hide();
            }
            _ => {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            window_minimize,
            window_toggle_maximize,
            window_hide_to_tray,
            window_set_pinned,
            window_dock,
            window_undock,
            ai_pipeline_ping,
            ai_pipeline_chat,
        ])
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .setup(|app| {
            #[cfg(desktop)]
            {
                use tauri_plugin_global_shortcut::{
                    Code,
                    Modifiers,
                    ShortcutState,
                };

                app.handle()
                    .plugin(
                        tauri_plugin_global_shortcut::Builder::new()
                            .with_shortcuts(["ctrl+shift+space"])?
                            .with_handler(|app, shortcut, event| {
                                if event.state == ShortcutState::Pressed
                                    && shortcut.matches(
                                        Modifiers::CONTROL | Modifiers::SHIFT,
                                        Code::Space,
                                    )
                                {
                                    toggle_main_window(app);
                                }
                            })
                            .build(),
                    )?;
            }

            let show_i =
                MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;

            let quit_i =
                MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

            let menu =
                Menu::with_items(app, &[&show_i, &quit_i])?;

            let _tray = TrayIconBuilder::with_id("main-tray")
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("AI-TOLED  ·  Ctrl+Shift+Space")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => toggle_main_window(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        toggle_main_window(tray.app_handle());
                    }
                })
                .build(app)?;

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}