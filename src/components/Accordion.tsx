import React, { useState } from "react";

const resources = [
  {
    id: "patterns",
    title: "Interaction patterns",
    body:
      "Guidelines for orchestrating attestations, with motion durations, easing curves, and content structure to keep users aligned."
  },
  {
    id: "tokens",
    title: "Design tokens",
    body:
      "Extendable color, spacing, and typography tokens with JSON exports, ready for code consumption across stacks."
  },
  {
    id: "accessibility",
    title: "Accessibility playbook",
    body:
      "Inclusive defaults, keyboard-first navigation, and focus recipes tested against WCAG AA requirements."
  }
];

export const Accordion: React.FC = () => {
  const [openItem, setOpenItem] = useState<string | null>(resources[0].id);

  return (
    <section className="accordion" id="resources" aria-labelledby="resources-heading">
      <div className="accordion__header">
        <p className="accordion__eyebrow">Resource hub</p>
        <h2 id="resources-heading">Operationalize your team&apos;s trust rituals</h2>
        <p>
          Documentation, motion principles, and accessibility checklists aligned with Sign Protocol&apos;s brand language.
        </p>
      </div>
      <div className="accordion__items">
        {resources.map((resource) => {
          const isOpen = openItem === resource.id;
          const panelId = `${resource.id}-panel`;
          const buttonId = `${resource.id}-trigger`;
          return (
            <article key={resource.id} className="accordion__item" data-open={isOpen}>
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenItem(isOpen ? null : resource.id)}
                >
                  <span>{resource.title}</span>
                  <span aria-hidden="true" className="accordion__icon" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen}>
                <p>{resource.body}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
