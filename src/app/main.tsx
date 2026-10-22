import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { loadPlugins } from "./plugins";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

// Plugins register their modules first, so every editor and the agent server include them.
void loadPlugins().then(() =>
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
