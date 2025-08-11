/**
 * Bubble Game
 * Copyright (c) 2025 Soumyadip Sarkar. All rights reserved.
 * Licensed under the MIT License.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
