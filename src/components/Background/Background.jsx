import { Outlet } from "react-router-dom";
import ParticleAnimation from "./ParticleAnimation";
import { useContext } from "react";
import { ContextTheme } from "../../contexts/ContextTheme/ContextTheme";

export default function Background() {
  const contextTheme = useContext(ContextTheme);

  return (
    <div>
      <div style={{ position: "fixed", zIndex: "-998" }}>
        <ParticleAnimation
          numParticles={200}
          color={
            contextTheme.darkMode
              ? { r: 158, g: 217, b: 249, a: 255 }
              : { r: 20, g: 20, b: 20, a: 255 }
          }
        />
      </div>
      <Outlet />
    </div>
  );
}
