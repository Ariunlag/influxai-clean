// src/components/classes/Graphs/CombinedGraph.tsx
import { Line } from "react-chartjs-2";
import { useInfluxStore } from "../../../store/useInfluxStore";
import { createLineChartConfig } from "../../../services/lineChartService";
import "chartjs-adapter-date-fns";

export default function CombinedGraph() {
  const builderTimeseriesData = useInfluxStore((s) => s.builderTimeseriesData);

  if (builderTimeseriesData.length === 0) return null;

  const { data, options } = createLineChartConfig(builderTimeseriesData);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        height: "400px",
        padding: "1rem",
        backgroundColor: "#1c1c1c",
        borderRadius: "8px",
        color: "#fff",
        marginBottom: "2rem",
      }}
    >
      <h4 style={{ marginBottom: "0.5rem" }}>Combined Graph (Builder)</h4>
      <Line data={data} options={options} />
    </div>
  );
}