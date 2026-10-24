use iroh::endpoint::{ReadExactError, RecvStream, SendStream};

/// The largest frame accepted: a whole document with its images is sent as one.
const MAX_FRAME_BYTES: usize = 256 * 1024 * 1024;

/// Writes one frame: its length (u32, big endian), then its bytes.
pub async fn write_frame(send: &mut SendStream, payload: &[u8]) -> Result<(), String> {
    let len = u32::try_from(payload.len()).map_err(|_| "frame too large".to_string())?;
    send.write_all(&len.to_be_bytes()).await.map_err(|e| e.to_string())?;
    send.write_all(payload).await.map_err(|e| e.to_string())
}

/// Reads one frame, or `None` when the stream ended cleanly between frames.
pub async fn read_frame(recv: &mut RecvStream) -> Result<Option<Vec<u8>>, String> {
    let mut header = [0u8; 4];
    match recv.read_exact(&mut header).await {
        Ok(()) => {}
        Err(ReadExactError::FinishedEarly(0)) => return Ok(None),
        Err(error) => return Err(error.to_string()),
    }
    let len = u32::from_be_bytes(header) as usize;
    if len > MAX_FRAME_BYTES {
        return Err(format!("frame of {len} bytes is over the limit"));
    }
    let mut payload = vec![0u8; len];
    recv.read_exact(&mut payload).await.map_err(|e| e.to_string())?;
    Ok(Some(payload))
}
