// realtime/SavedClasses/SavedClassGraph.tsx
import { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useInfluxStore } from '../../store/useInfluxStore';
import { createLineChartConfig } from '../../services/lineChartService';

export const SavedClassGraph = () => {
  const selectedClass = useInfluxStore((s) => s.selectedClass);
  const savedClassTimeseriesData = useInfluxStore((s) => s.savedClassTimeseriesData);
  const fetchTimeseriesData = useInfluxStore((s) => s.fetchTimeseriesData);

  useEffect(() => {
    if (selectedClass) {
      console.log('[SavedClassGraph] Loading class:', selectedClass.name);
      fetchTimeseriesData();
    }
  }, [selectedClass, fetchTimeseriesData]);

  if (!selectedClass) {
    return <div>Please select a class to view its data.</div>;
  }

  if (savedClassTimeseriesData.length === 0) {
    return <div>Loading class data...</div>;
  }

  const chartConfig = createLineChartConfig(savedClassTimeseriesData);

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
      <h4>Class: {selectedClass.name}</h4>
      <Line data={chartConfig.data} options={chartConfig.options} />
    </div>
  );
};
