import React from 'react';
import './Metric.css';

const Metric = ({ label, value, delta, deltaType = 'normal', help = null, deltaDecimals = 0, currency = 'EUR' }) => {
  const getDeltaClass = () => {
    if (!delta) return '';
    if (deltaType === 'aucun') return '';
    if (deltaType === 'inverse') {
      return delta > 0 ? 'metric-delta-negative' : 'metric-delta-positive';
    }
    return delta > 0 ? 'metric-delta-positive' : 'metric-delta-negative';
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      'EUR': '€',
      'USD': '$',
      'GBP': '£',
      'JPY': '¥',
      'CHF': 'CHF',
      'CAD': 'C$',
      'AUD': 'A$',
    };
    return symbols[currency] || currency;
  };

  const formatDelta = (delta, decimals = 0, currency = 'EUR') => {
    if ((!delta && delta !== 0) || typeof delta !== 'number' || !Number.isFinite(delta)) return '';
    const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
    // Format avec virgule pour décimales et espaces pour milliers
    const formatted = Math.abs(delta).toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    // Si currency est vide, on suppose que c'est un pourcentage
    if (currency === '') {
      return `${sign}${formatted}%`;
    }
    const symbol = getCurrencySymbol(currency);
    return `${sign}${formatted} ${symbol}`;
  };

  return (
    <div className="bpm-metric">
      <div className="bpm-metric-label">
        {label}
        {help && (
          <span className="bpm-metric-help" title={help}>
            ⓘ
          </span>
        )}
      </div>
      <div className="bpm-metric-value">{value}</div>
      <div className={`bpm-metric-delta ${getDeltaClass()} ${delta !== undefined && delta !== null ? '' : 'bpm-metric-delta-empty'}`}>
        {delta !== undefined && delta !== null ? (
          <>
            <span className="bpm-metric-delta-arrow">
              {delta > 0 ? '▲' : delta < 0 ? '▼' : '—'}
            </span>
            <span className="bpm-metric-delta-value">{formatDelta(delta, deltaDecimals, currency)}</span>
          </>
        ) : (
          <span className="bpm-metric-delta-placeholder">&nbsp;</span>
        )}
      </div>
    </div>
  );
};

export default Metric;