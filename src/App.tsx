import { Box, CircularProgress, CssBaseline, CssVarsProvider, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { HealthApi } from "./pudu/generated";
import "./App.css";
import '@fontsource/inter';

const healthApi = new HealthApi();

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    healthApi.isPuduAlive().then(() => setReady(true));
  }, []);

  return (
    <CssVarsProvider>
      <CssBaseline />
      {ready ? (
        <div>
          ready!
        </div>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" gap={2}>
          <CircularProgress />
          <Typography level="body-sm">Connecting to sidecar...</Typography>
        </Box>
      )}
    </CssVarsProvider>
  );
}

export default App;
