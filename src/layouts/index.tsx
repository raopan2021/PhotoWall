import Box from "@mui/material/Box";
import { Outlet } from "react-router";
import ToggleColorMode from "@/components/header/ToggleColorMode";

const App: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        color: "text.primary",
        borderRadius: 1,
        p: 3,
      }}
    >
      <header className="w-full h-[60px]">
        <ToggleColorMode />
      </header>
      <main>
        <Outlet />
      </main>
    </Box>
  );
};

export default App;
