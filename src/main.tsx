import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import "virtual:uno.css";
import "@unocss/reset/normalize.css";
import "./assets/styles/index.css";

createRoot(document.getElementById("root")!).render(<App />);
