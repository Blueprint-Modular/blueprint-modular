import React from 'react';
import './DocSidebar.css';

/**
 * Sidebar de navigation pour le site doc BPM.
 * @param {Object} props
 * @param {Array<{ title: string, links: Array<{ label: string, href: string, active?: boolean }> }>} props.sections - Sections (titre + liens)
 * @param {React.ElementType} [props.linkComponent='a'] - Composant pour les liens (ex. Link de react-router-dom)
 * @param {string} [props.className]
 */
const DocSidebar = ({ sections = [], linkComponent: LinkComp = 'a', className = '' }) => (
  <aside className={`bpm-doc-sidebar ${className}`.trim()} role="navigation">
    {sections.map((section, i) => (
      <div key={i} className="bpm-doc-sidebar-section">
        <h3 className="bpm-doc-sidebar-title">{section.title}</h3>
        {section.links.map((link, j) => (
          <LinkComp
            key={j}
            {...(LinkComp === 'a' ? { href: link.href } : { to: link.href })}
            className={`bpm-doc-sidebar-link ${link.active ? 'bpm-doc-sidebar-link-active' : ''}`.trim()}
          >
            {link.label}
          </LinkComp>
        ))}
      </div>
    ))}
  </aside>
);

export default DocSidebar;
