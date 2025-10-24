import React from "react";
import { Accordion } from "./components/Accordion";
import { CardGrid } from "./components/CardGrid";
import { Hero } from "./components/Hero";
import { Layout } from "./components/Layout";
import { Tabs } from "./components/Tabs";

const trustSignals = [
  {
    title: "Composable attestations",
    description: "Trigger credentials from forms, workflows, or web3 actions with one design language."
  },
  {
    title: "Live protocol states",
    description: "Stream trust badges, approval status, and risk alerts directly into your product UI."
  },
  {
    title: "Universal brand cohesion",
    description: "Sync theming tokens across dark mode, marketing sites, dashboards, and partner embeds."
  }
];

const App: React.FC = () => {
  return (
    <Layout>
      <Hero />
      <CardGrid />
      <Tabs />
      <section className="stack stack--alt" id="use-trust" aria-label="Trust primitives">
        <div className="stack__header">
          <p className="stack__eyebrow">Signal integrity</p>
          <h2>Bring trusted attestations into every touchpoint</h2>
          <p className="stack__description">
            Combine cards, accordions, tooltips, and tabs with Sign Protocol&apos;s theming engine for an ecosystem-grade
            experience layer.
          </p>
        </div>
        <div className="callout-grid">
          {trustSignals.map((signal) => (
            <article key={signal.title} className="callout">
              <h3>{signal.title}</h3>
              <p>{signal.description}</p>
            </article>
          ))}
        </div>
      </section>
      <Accordion />
      <section className="cta" id="get-started" aria-labelledby="cta-heading">
        <div className="cta__content">
          <h2 id="cta-heading">Preview the Sign Protocol console</h2>
          <p>
            Test responsive breakpoints, trigger themed microinteractions, and toggle dark mode in a live environment.
          </p>
        </div>
        <form className="cta__form" aria-label="Request early access">
          <label htmlFor="email" className="cta__label">
            Work email
          </label>
          <input id="email" name="email" type="email" placeholder="you@team.com" required autoComplete="email" />
          <button type="submit" className="button button--primary">
            Request access
          </button>
        </form>
      </section>
    </Layout>
  );
};

export default App;
