// src/components/classes/Graphs/IndividualGraph.tsx
import { Line } from "react-chartjs-2";
import { createLineChartConfig } from "../../../services/lineChartService";
import type { TimeseriesData } from "../../../types/influx";
import "chartjs-adapter-date-fns";

export function IndividualGraph({ data }: { data: TimeseriesData }) {
  // ✅ WRAP single series in array
  const { data: chartData, options } = createLineChartConfig([data]);

  return (
    <div
      style={{
        margin: "1rem 0",
        padding: "1rem",
        borderRadius: "8px",
        backgroundColor: "#1c1c1c",
        color: "#fff",
      }}
    >
      <h4 style={{ marginBottom: "0.5rem" }}>{data.measurement}</h4>
      <div style={{ width: "100%", height: "300px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
