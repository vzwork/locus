/* eslint-disable */

import { useContext } from "react";
import { ContextTheme } from "../../contexts/ContextTheme/ContextTheme";
import ParticleAnimation from "./ParticleAnimation";
import { Box } from "@mui/material";

export default function Background() {
  const contextTheme = useContext(ContextTheme);

  return (
    <Box sx={{ position: "fixed", zIndex: "1" }}>
      <ParticleAnimation
        numParticles={200}
        color={
          contextTheme.darkMode
            ? { r: 158, g: 217, b: 249, a: 255 }
            : { r: 20, g: 20, b: 20, a: 255 }
        }
      />
    </Box>
  );
}
