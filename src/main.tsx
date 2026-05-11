import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/global.css";

console.log("[boot] React works");

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root missing");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
