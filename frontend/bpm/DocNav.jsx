import React from 'react';
import './DocNav.css';

/**
 * Barre de navigation supérieure pour le site doc BPM.
 * @param {Object} props
 * @param {string} [props.logoUrl] - URL du logo
 * @param {string} [props.homeUrl='/'] - Lien accueil
 * @param {Array<{ label: string, href: string }>} props.links - Liens (Get started, Components, API Reference, etc.)
 * @param {React.ElementType} [props.linkComponent='a'] - Composant pour les liens (ex. Link de react-router-dom pour SPA)
 */
const DocNav = ({ logoUrl, homeUrl = '/', links = [], linkComponent: LinkComp = 'a', className = '' }) => (
  <nav className={`bpm-doc-nav ${className}`.trim()} role="navigation">
    <LinkComp {...(LinkComp === 'a' ? { href: homeUrl } : { to: homeUrl })} className="bpm-doc-nav-brand">
      {logoUrl && <img src={logoUrl} alt="" className="bpm-doc-nav-logo" />}
      <span className="bpm-doc-nav-word-blueprint">Blueprint</span>
      <span className="bpm-doc-nav-word-modular">Modular</span>
    </LinkComp>
    {links.map((link, i) => (
      <LinkComp key={i} {...(LinkComp === 'a' ? { href: link.href } : { to: link.href })} className="bpm-doc-nav-link">
        {link.label}
      </LinkComp>
    ))}
  </nav>
);

export default DocNav;
