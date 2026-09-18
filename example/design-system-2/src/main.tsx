import React from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/sonner";
import "./theme-overrides.css";
document.documentElement.classList.add("dark");
createRoot(document.getElementById("root")!).render(<React.StrictMode><TooltipProvider><App /><Toaster /></TooltipProvider></React.StrictMode>);
