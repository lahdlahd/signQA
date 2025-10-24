import React from "react";
import { useTheme } from "./ThemeProvider";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const label = theme === "light" ? "Activate dark mode" : "Activate light mode";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={label}
      onClick={toggleTheme}
      title={label}
    >
      <span aria-hidden="true" className="theme-toggle__icon">
        <span className="theme-toggle__sun" />
        <span className="theme-toggle__moon" />
      </span>
      <span className="theme-toggle__label">{theme === "light" ? "Light" : "Dark"}</span>
    </button>
  );
};
