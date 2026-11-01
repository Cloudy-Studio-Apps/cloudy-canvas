//! The macOS menu bar. The default Quit item calls `terminate:`, which ends the app without a
//! `CloseRequested`, so it would skip the unsaved-changes question and the tasks that run on
//! quitting. This keeps the default menu with a Quit that closes the window instead.

use tauri::menu::{Menu, MenuItem, MenuItemKind};
use tauri::{App, Manager};

const QUIT_ID: &str = "cloudy-quit";

pub fn setup(app: &App) -> tauri::Result<()> {
    let menu = Menu::default(app.handle())?;
    if let Some(submenu) = menu.items()?.first().and_then(MenuItemKind::as_submenu) {
        if let Some(MenuItemKind::Predefined(quit)) = submenu.items()?.last() {
            let label = quit.text()?;
            submenu.remove(quit)?;
            submenu.append(&MenuItem::with_id(app, QUIT_ID, label, true, Some("CmdOrCtrl+Q"))?)?;
        }
    }
    app.set_menu(menu)?;
    app.on_menu_event(|app, event| {
        if event.id().as_ref() != QUIT_ID {
            return;
        }
        // Closing emits `CloseRequested`, which the webview answers; `destroy` wouldn't.
        match app.get_webview_window("main") {
            Some(window) => {
                let _ = window.close();
            }
            None => app.exit(0),
        }
    });
    Ok(())
}
