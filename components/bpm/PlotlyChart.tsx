"use client";
import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

/**
 * @component bpm.plotlyChart
 * @description Graphique interactif Plotly.js avec support de tous types de traces (bar, line, scatter, etc.).
 * @example
 * bpm.plotlyChart({ data: [{ type: "bar", x: ["A", "B"], y: [10, 20] }], height: 400 })
 *
 * @param {object} props
 * @param {object[]} [props.data] - Tableau de traces Plotly. Optionnel.
 * @param {object} [props.layout] - Config layout Plotly (title, axes). Optionnel.
 * @param {object} [props.config] - Config Plotly (responsive, displayModeBar). Optionnel.
 * @param {number} [props.height=400] - Hauteur en pixels. Optionnel.
 * @param {number|string} [props.width="100%"] - Largeur. Optionnel.
 * @param {string} [props.className=""] - Classes CSS additionnelles. Optionnel.
 * @param {string} [props.iframeSrc] - URL iframe (compatibilité ascendante). Optionnel.
 *
 * @parent bpm.panel, bpm.card, bpm.tabs
 * @associated bpm.metric, bpm.selectbox, bpm.dateRangePicker
 */
export interface PlotlyChartProps {
  /** PARENT: bpm.panel | bpm.card | bpm.tabs (contenu onglet). INTERDIT: données vides [] passées à data — utiliser chartsReady guard. ASSOCIÉ: bpm.metric (contexte chiffre), bpm.selectbox (filtre période), bpm.dateRangePicker. */
  /** Tableau de traces Plotly (ex. [{type:'bar', x:[], y:[]}]). Obligatoire. */
  data?: object[];
  /** Config layout Plotly (title, xaxis, yaxis, etc.). */
  layout?: object;
  /** Config Plotly (responsive, displayModeBar, etc.). */
  config?: object;
  /** Hauteur en pixels. Default: 400. */
  height?: number;
  width?: number | string;
  className?: string;
  iframeSrc?: string; // compatibilité ascendante
}

class ChartBoundary extends React.Component<
  { children: React.ReactNode; height: number },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <div
          style={{
            height: this.props.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--bpm-text-secondary)",
            fontSize: "var(--bpm-font-size-base)",
          }}
        >
          Graphique indisponible
        </div>
      );
    return this.props.children;
  }
}

export function PlotlyChart(props: PlotlyChartProps) {
  const {
    data,
    layout,
    config,
    height = 380,
    width = "100%",
    className = "",
    iframeSrc,
  } = props;

  const w = typeof width === "number" ? width + "px" : width;
  const h = typeof height === "number" ? height + "px" : height;

  // Compatibilité ascendante : si iframeSrc fourni
  if (iframeSrc) {
    return (
      <iframe
        src={iframeSrc}
        title="Plotly"
        className={"bpm-plotly " + className}
        style={{
          width: w,
          height: h,
          border: 0,
          borderRadius: "var(--bpm-radius)",
          background: "var(--bpm-bg-secondary)",
        }}
      />
    );
  }

  const mergedLayout = {
    height,
    autosize: true,
    margin: { t: 30, r: 20, b: 60, l: 60 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { family: "inherit", size: 12 },
    ...layout,
  };

  const hasData = Array.isArray(data) && data.length > 0;
  if (!hasData) {
    return (
      <div
        className={"bpm-plotly-wrapper " + className}
        style={{
          width: w,
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--bpm-text-secondary)",
          fontSize: "var(--bpm-font-size-base)",
          background: "var(--bpm-bg-secondary)",
          borderRadius: "var(--bpm-radius)",
        }}
      >
        Aucune donnée à afficher
      </div>
    );
  }

  return (
    <ChartBoundary height={height}>
      <div className={"bpm-plotly-wrapper " + className} style={{ width: w }}>
        <Plot
          data={data as Plotly.Data[]}
          layout={mergedLayout as Partial<Plotly.Layout>}
          config={
            {
              displayModeBar: false,
              responsive: true,
              ...config,
            } as Partial<Plotly.Config>
          }
          useResizeHandler
          style={{ width: "100%" }}
        />
      </div>
    </ChartBoundary>
  );
}
