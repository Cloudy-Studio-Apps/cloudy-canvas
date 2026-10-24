use std::sync::{Arc, Mutex};

use super::session::Session;

/// The live session this app is in, if any: one at a time, hosting or joined.
#[derive(Clone, Default)]
pub struct ShareState(Arc<Mutex<Option<Session>>>);

impl ShareState {
    pub fn new() -> Self {
        Self::default()
    }

    /// Session `id`, while it's the current one.
    pub fn session(&self, id: u32) -> Option<Session> {
        self.0.lock().ok()?.clone().filter(|session| session.id == id)
    }

    /// Takes session `id` out, if it's the current one (a later session is left alone).
    pub fn take(&self, id: u32) -> Option<Session> {
        let mut current = self.0.lock().ok()?;
        if current.as_ref().is_some_and(|session| session.id == id) {
            current.take()
        } else {
            None
        }
    }

    /// Makes `session` the current one and returns the one it replaces.
    pub fn replace(&self, session: Option<Session>) -> Option<Session> {
        let mut current = self.0.lock().ok()?;
        std::mem::replace(&mut *current, session)
    }
}
