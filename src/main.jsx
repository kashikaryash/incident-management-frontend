import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App.jsx";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "#64b5f6",
      main: "#2196f3",
      dark: "#1976d2",
    },
    grey: {
      light: "#e0e0e0",
      main: "#9e9e9e",
      dark: "#757575",
    },
  },
});


const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </StrictMode>
  );
}
