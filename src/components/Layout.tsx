import React from "react";
import { Navigation } from "./Navigation";

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="layout" id="top">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <span aria-hidden="true" className="layout__glow layout__glow--one" />
      <span aria-hidden="true" className="layout__glow layout__glow--two" />
      <Navigation />
      <main className="layout__main" id="main-content">
        {children}
      </main>
      <footer className="site-footer" aria-labelledby="footer-heading">
        <div className="site-footer__inner">
          <div>
            <p id="footer-heading" className="site-footer__title">
              Sign Protocol
            </p>
            <p className="site-footer__tagline">
              A unified trust layer for verifiable data experiences.
            </p>
          </div>
          <div className="site-footer__links">
            <a href="#vision">Vision</a>
            <a href="#features">Platform</a>
            <a href="#use-cases">Use cases</a>
            <a href="#resources">Resources</a>
          </div>
          <div className="site-footer__meta">
            <p>© {new Date().getFullYear()} Sign Protocol. Crafted for accessibility & delight.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
