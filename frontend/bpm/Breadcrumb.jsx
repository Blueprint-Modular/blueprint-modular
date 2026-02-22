import React from 'react';
import './Breadcrumb.css';

/**
 * Fil d'Ariane. items = [{ label, href? }]. Dernier item sans href = page courante.
 */
const Breadcrumb = ({ items = [], separator = '›', className = '', ...props }) => (
  <nav className={`bpm-breadcrumb ${className}`.trim()} aria-label="Fil d'Ariane" {...props}>
    <ol className="bpm-breadcrumb-list">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <li key={i} className="bpm-breadcrumb-item">
            {i > 0 && <span className="bpm-breadcrumb-sep" aria-hidden="true">{separator}</span>}
            {item.href && !isLast ? (
              <a href={item.href} className="bpm-breadcrumb-link">{item.label}</a>
            ) : (
              <span className="bpm-breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;
