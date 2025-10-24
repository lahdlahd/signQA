import React from "react";
import { Tooltip } from "./Tooltip";

const stats = [
  { label: "Verified attestations", value: "78k+" },
  { label: "Ecosystem partners", value: "120+" },
  { label: "Avg. confirmation", value: "<2s" }
];

export const Hero: React.FC = () => {
  return (
    <section className="hero" id="vision" aria-labelledby="hero-heading">
      <div className="hero__content">
        <p className="hero__eyebrow">Trust-first experience design</p>
        <h1 id="hero-heading" className="hero__title">
          Design with conviction.<br /> Deploy with confidence.
        </h1>
        <p className="hero__subtitle">
          Sign Protocol lets teams ship fully verifiable experiences with a cohesive design
          language, programmable attestations, and delightful microinteractions baked in.
        </p>
        <div className="hero__actions">
          <Tooltip content="See how teams orchestrate trust across every touchpoint.">
            <a className="button button--primary button--xl" href="#get-started">
              Explore live demo
            </a>
          </Tooltip>
          <a className="button button--ghost button--xl" href="#features">
            View design system
          </a>
        </div>
        <dl className="hero__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="hero__stat">
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <div className="hero__orb" />
        <div className="hero__badge">
          <span>Real-time attestations</span>
          <strong>Live</strong>
        </div>
        <div className="hero__card">
          <p className="hero__card-title">Composable trust widgets</p>
          <p className="hero__card-body">Drop in credentials, proofs, and verifications with a click.</p>
          <div className="hero__card-foot">
            <span className="hero__pulse" />
            <span>Deploying updates</span>
          </div>
        </div>
      </div>
    </section>
  );
};
