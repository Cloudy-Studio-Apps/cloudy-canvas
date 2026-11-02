package com.darkredgm.cloudycanvas

import android.os.Bundle
import android.view.View
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

// Written by hand: `tauri android init` would replace this file, so put this back after one.
class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
    keepClearOfSystemUi()
  }

  /** Android draws apps under its bars, the notch and the keyboard; the webview stays out of them. */
  private fun keepClearOfSystemUi() {
    val content = findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
      val system = insets.getInsets(
        WindowInsetsCompat.Type.systemBars() or
          WindowInsetsCompat.Type.displayCutout() or
          WindowInsetsCompat.Type.ime()
      )
      view.setPadding(system.left, system.top, system.right, system.bottom)
      WindowInsetsCompat.CONSUMED
    }
  }
}
