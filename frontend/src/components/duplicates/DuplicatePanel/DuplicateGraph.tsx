import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { useDuplicateStore } from "../../../store/useDuplicateStore";
import { getDuplicatesData, confirmDuplicate } from "../../../services/duplicateApi";
import { createLineChartConfig } from "../../../services/lineChartService";
import "chartjs-adapter-date-fns";

interface DuplicateGraphProps {
  onClose: () => void;
}

export const DuplicateGraph: React.FC<DuplicateGraphProps> = ({ onClose }) => {
  const selectedPair = useDuplicateStore((s) => s.selectedPair);
  const clearSelection = useDuplicateStore((s) => s.clearSelection);
  const removeDuplicate = useDuplicateStore((s) => s.removeDuplicate);

  const [mergedData, setMergedData] = useState<
    { time: string; [key: string]: number | null; tags1?: any; tags2?: any }[]
  >([]);

  useEffect(() => {
    if (!selectedPair) return;

    const [t1, t2] = selectedPair.topics;

    getDuplicatesData(t1, t2)
      .then(({ data1, data2 }) => {
        const merged = data1.map((pt1, i) => ({
          time: new Date(pt1.timestamp * 1000).toISOString(),
          [t1]: pt1.value,
          [t2]: data2[i]?.value ?? null,
          tags1: pt1.tags,
          tags2: data2[i]?.tags ?? null,
        }));
        setMergedData(merged);
      })
      .catch((err) => console.error("[DuplicateGraph] Failed to load data:", err));
  }, [selectedPair]);

  if (!selectedPair) return null;

  const [topicA, topicB] = selectedPair.topics;

  // ✅ Build TimeseriesData[]
  const seriesList = [
    {
      measurement: topicA,
      points: mergedData.map((pt) => ({
        time: pt.time,
        value: pt[topicA],
        tags: pt.tags1,
      })),
    },
    {
      measurement: topicB,
      points: mergedData.map((pt) => ({
        time: pt.time,
        value: pt[topicB],
        tags: pt.tags2,
      })),
    },
  ];

  const { data: chartData, options } = createLineChartConfig(seriesList, ["#0af", "#f0f"]);

  const handleUnsubscribe = async (topic: string) => {
    try {
      await confirmDuplicate({ action: "delete", topics: [topic] });
      removeDuplicate(selectedPair);
      clearSelection();
      onClose();
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
    }
  };

  const handleKeep = async () => {
    try {
      await confirmDuplicate({ action: "keep", topics: selectedPair.topics });
      removeDuplicate(selectedPair);
      clearSelection();
      onClose();
    } catch (err) {
      console.error("Failed to keep both:", err);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#1c1c1c",
        borderRadius: "8px",
        color: "#fff",
        marginTop: "16px",
      }}
    >
      <div style={{ width: "100%", height: "300px" }}>
        <Line
          key={`${mergedData.length}-${selectedPair?.topics.join('-')}`} // 🗝️ fixes canvas reuse
          data={chartData}
          options={options}
        />
      </div>
      {/* <div style={{ marginTop: "12px", color: "#ccc" }}>
        <strong>Similarity:</strong><br/>
        Identity: {selectedPair?.scores?.identity.toFixed(4)}<br/>
        Correlation: {selectedPair?.scores?.correlation.toFixed(4)}<br/>
        Confidence: {(
          ((selectedPair?.scores?.identity || 0) + (selectedPair?.scores?.correlation || 0)) / 2
        ).toFixed(4)}
      </div> */}

      <h4 style={{ flex: 1, margin: 0, color: "gold", marginTop: "16px" }}>
        Unsubscribe:
      </h4>

      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
        <button
          onClick={() => handleUnsubscribe(topicA)}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "transparent",
            color: "#fff",
            border: "1px solid red",
            fontSize: "12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          “{topicA}”
        </button>

        <button
          onClick={() => handleUnsubscribe(topicB)}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "transparent",
            color: "#fff",
            border: "1px solid red",
            fontSize: "12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          “{topicB}”
        </button>

        <button
          onClick={handleKeep}
          style={{
            flex: 1,
            padding: "8px",
            backgroundColor: "transparent",
            color: "#38a169",
            border: "1px solid green",
            fontSize: "12px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Keep Both
        </button>
      </div>
    </div>
  );
};

export default DuplicateGraph;
