import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import { RouterProvider } from "react-router";
import router from "@/router";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;
