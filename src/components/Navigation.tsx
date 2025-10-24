import React, { useEffect, useId, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "#vision", label: "Vision" },
  { href: "#features", label: "Features" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#resources", label: "Resources" }
];

export const Navigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href="#top">
          <span aria-hidden="true" className="site-header__orb" />
          <span className="site-header__wordmark">Sign Protocol</span>
        </a>
        <button
          type="button"
          className="site-header__menu-toggle"
          aria-expanded={isMenuOpen}
          aria-controls={navId}
          data-open={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="site-header__menu-label">Menu</span>
          <span aria-hidden="true" className="site-header__menu-icon">
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="site-header__theme-toggle-mobile">
          <ThemeToggle />
        </div>
        <nav
          className="site-nav"
          aria-label="Primary"
          id={navId}
          data-open={isMenuOpen}
        >
          <ul className="site-nav__list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a className="site-nav__link" href={link.href} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="site-nav__cta">
            <a className="button button--primary" href="#get-started">
              Launch Console
            </a>
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};
