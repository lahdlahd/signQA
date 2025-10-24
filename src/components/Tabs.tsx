import React, { useMemo, useState } from "react";

const tabs = [
  {
    id: "developers",
    label: "Developers",
    description: "API-first workflows",
    content:
      "Launch attestations via SDKs, monitor verifiable credentials, and stream analytics without leaving the console."
  },
  {
    id: "designers",
    label: "Designers",
    description: "Visual orchestration",
    content:
      "Scale pixel-perfect components with motion guidelines, ready-to-sync tokens, and live prototyping hooks."
  },
  {
    id: "operators",
    label: "Operators",
    description: "Compliance alignment",
    content:
      "Automate trust checks, audit trails, and stakeholder notifications backed by tamper-proof signatures."
  }
];

const getTabIndex = (id: string) => tabs.findIndex((tab) => tab.id === id);

export const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const focusTab = (id: string) => {
    if (typeof window === "undefined") return;
    window.requestAnimationFrame(() => {
      document.getElementById(`${id}-tab`)?.focus();
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    const currentIndex = getTabIndex(id);
    if (currentIndex === -1) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextId = tabs[nextIndex].id;
      setActiveTab(nextId);
      focusTab(nextId);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      const nextId = tabs[nextIndex].id;
      setActiveTab(nextId);
      focusTab(nextId);
    } else if (event.key === "Home") {
      event.preventDefault();
      const firstId = tabs[0].id;
      setActiveTab(firstId);
      focusTab(firstId);
    } else if (event.key === "End") {
      event.preventDefault();
      const lastId = tabs[tabs.length - 1].id;
      setActiveTab(lastId);
      focusTab(lastId);
    }
  };

  const active = useMemo(() => tabs.find((tab) => tab.id === activeTab) ?? tabs[0], [activeTab]);

  return (
    <section className="tabs" id="use-cases" aria-labelledby="tabs-heading">
      <div className="tabs__header">
        <p className="tabs__eyebrow">Use cases</p>
        <h2 id="tabs-heading">Every team, orchestrated around trusted data</h2>
        <p>
          Tabs with keyboard navigation and motion tuned to Sign Protocol&apos;s interaction language deliver clarity at
          scale.
        </p>
      </div>
      <div className="tabs__container">
        <div className="tabs__list" role="tablist" aria-label="Sign Protocol personas">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${tab.id}-tab`}
                aria-selected={isSelected}
                aria-controls={`${tab.id}-panel`}
                tabIndex={isSelected ? 0 : -1}
                className="tabs__tab"
                data-selected={isSelected}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => handleKeyDown(event, tab.id)}
              >
                <span className="tabs__label">{tab.label}</span>
                <span className="tabs__description">{tab.description}</span>
              </button>
            );
          })}
        </div>
        <div
          className="tabs__panel"
          role="tabpanel"
          id={`${active.id}-panel`}
          aria-labelledby={`${active.id}-tab`}
        >
          <p>{active.content}</p>
          <div className="tabs__meta">
            <p>
              Time to value: <strong>&lt; 7 minutes</strong>
            </p>
            <p>
              Accessible by default: <strong>WCAG AA</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
