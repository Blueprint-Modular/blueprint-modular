"use client";

import React, { useState, useEffect } from "react";

export interface TabItem {
  label: string;
  content: React.ReactNode | null;
  key?: string | number;
}

export type TabsItems = (string | TabItem)[];

export interface TabsProps {
  /** PARENT: bpm.panel | bpm.container | page directe. INTERDIT: bpm.tabs imbriqué dans un autre bpm.tabs. ASSOCIÉ: bpm.table (contenu onglet data), bpm.plotlyChart (contenu onglet graphique), bpm.metric. */
  /** Onglets : tableau de { label, content } ou chaînes (label uniquement). */
  tabs?: TabsItems;
  /** Index de l'onglet actif au montage. Default: 0. */
  defaultTab?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export function Tabs({
  tabs = [],
  defaultTab = 0,
  onChange,
  className = "",
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab !== undefined && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    onChange?.(index);
  };

  const normalizedTabs: TabItem[] = tabs.map((tab, index) => {
    if (typeof tab === "string") {
      return { label: tab, content: null, key: index };
    }
    return { ...tab, key: tab.key ?? index };
  });

  const activeContent = normalizedTabs[activeTab]?.content;

  return (
    <div className={`bpm-tabs-container w-full ${className}`}>
      <div
        className="bpm-tabs-header flex items-stretch gap-0 overflow-x-auto overflow-y-hidden"
        style={{ borderBottom: "1px solid var(--bpm-border)" }}
      >
        {normalizedTabs.map((tab, index) => (
          <button
            key={tab.key ?? index}
            type="button"
            className={`bpm-tab-button flex items-center justify-center py-3 px-4 text-sm whitespace-nowrap flex-1 min-w-0 transition-colors ${
              activeTab === index ? "bpm-tab-active font-medium" : ""
            }`}
            style={{
              color:
                activeTab === index
                  ? "var(--bpm-accent)"
                  : "var(--bpm-text-primary)",
            }}
            onClick={() => handleTabClick(index)}
            data-label={tab.label}
          >
            <span className="bpm-tab-button-text">{tab.label}</span>
          </button>
        ))}
      </div>
      <div
        className="bpm-tabs-content py-4 w-full overflow-x-hidden"
        style={{ background: "var(--bpm-bg-primary, #fff)" }}
      >
        {activeContent}
      </div>
    </div>
  );
}
