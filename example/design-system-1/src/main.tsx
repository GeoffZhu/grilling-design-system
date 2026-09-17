import React from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";
import "./index.css";
document.documentElement.classList.add("light");
createRoot(document.getElementById("root")!).render(<React.StrictMode><TooltipProvider><App /><Toaster /></TooltipProvider></React.StrictMode>);
