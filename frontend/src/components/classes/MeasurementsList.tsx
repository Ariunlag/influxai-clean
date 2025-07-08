import { useEffect } from "react";
import { useInfluxStore } from "../../store/useInfluxStore";

export default function MeasurementsList() {
  const { measurements, selectedMeasurements, addMeasurement, getMeasurements } = useInfluxStore();

  useEffect(() => {
    getMeasurements();
  }, [getMeasurements]);

  if (!measurements) {
    return <div>Loading measurements...</div>;
  }

  const availableMeasurements = measurements.filter(
    (measurement) => !selectedMeasurements.includes(measurement)
  );

  return (
    <div>
      <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Selecte measurement</h3>

      {availableMeasurements.length === 0 ? (
        <p>No more available measurement</p>
      ) : (
        <ul
        style={{
          backgroundColor: "transparent", 
          listStyleType: "none", 
          padding: 0,
          margin: 0,
          fontSize: "0.8rem", 
          maxHeight: "150px", 
          overflowY: "auto", 
          borderColor: '#black',
          borderRadius: "4px",
          paddingLeft: "0.5rem",
        }}
      >
        {availableMeasurements.map((measurement) => (
          <li
            key={measurement}
            onClick={() => addMeasurement(measurement)}

            style={{
                padding: "2px 0",
                cursor: "pointer",              
            }}
          >
            {measurement}
          </li>
        ))}
      </ul>
      )}
      
    </div>
  );
}
