import React from "react";

const cards = [
  {
    title: "Adaptive layout primitives",
    description:
      "Responsive tokens snap layouts to the perfect rhythm across breakpoints, with CSS variables you can extend on day one.",
    accent: "Layout"
  },
  {
    title: "Interactive feedback loops",
    description:
      "Microinteractions guide users with haptic-like feedback, easing friction for complex attestations and approvals.",
    accent: "Interaction"
  },
  {
    title: "Verified theming pipeline",
    description:
      "Theme once, share everywhere. Connect brand palettes to live attestations so trust is felt in every component.",
    accent: "Brand"
  }
];

export const CardGrid: React.FC = () => {
  return (
    <section className="stack" id="features" aria-labelledby="features-heading">
      <div className="stack__header">
        <p className="stack__eyebrow">Design system</p>
        <h2 id="features-heading">Crafted components for trustworthy experiences</h2>
        <p className="stack__description">
          A modular kit of cards, accordions, tabs, and tooltips ensures every interaction is accessible, themed, and
          ready for responsive rollouts.
        </p>
      </div>
      <div className="card-grid">
        {cards.map((card) => (
          <article key={card.title} className="card-grid__item">
            <span className="card-grid__accent" aria-hidden="true">
              {card.accent}
            </span>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
            <a className="card-grid__link" href="#get-started">
              Learn more
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};
