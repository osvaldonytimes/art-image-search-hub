import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1A1A1A",
    },
    background: {
      default: "#FFFFFF",
    },
    text: {
      primary: "#333333",
    },
    divider: "#E5E5E5",
  },
  typography: {
    fontFamily: "Kodchasan, Arial, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
  },
});

export default theme;
