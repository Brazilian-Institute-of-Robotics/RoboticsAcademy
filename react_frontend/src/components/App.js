import "../styles/App.css";
import ExerciseList from "./ExerciseList";
import DrawerAppBar from "./DrawerAppBar";
import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { HomepageProvider } from "../contexts/HomepageContext";
import Loading from "./message_system/Loading";

const theme = createTheme({
  palette: {
    type: "light",
    primary: {
      main: "#ffac15",
    },
    secondary: {
      main: "#147aff",
    },
  },
});

function App() {
  return (
    <HomepageProvider>
      <ThemeProvider theme={theme}>
        <Loading />
        <DrawerAppBar />
        <ExerciseList />
      </ThemeProvider>
    </HomepageProvider>
  );
}

export default App;
