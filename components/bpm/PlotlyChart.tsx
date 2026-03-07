"use client";
import React from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export interface PlotlyChartProps {
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
            fontSize: 13,
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
          borderRadius: 8,
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
          fontSize: 13,
          background: "var(--bpm-bg-secondary)",
          borderRadius: 8,
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
