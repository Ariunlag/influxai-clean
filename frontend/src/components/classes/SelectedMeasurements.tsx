import { useInfluxStore } from "../../store/useInfluxStore";

export default function SelectedMeasurements() {
    const { selectedMeasurements, removeMeasurement } = useInfluxStore();
    
    return (
           <div>
          <h3 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Selected Measurements</h3>
          <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
            {selectedMeasurements.length === 0 ? (
              <li style={{ color: '#777', fontSize: '0.8em', marginBottom: '5px' }}>
                No measurements selected.
              </li>
            ) : (
              selectedMeasurements.map((m) => (
                <li key={m} style={{ color: '#eee', fontSize: '0.8em', marginBottom: '4px' }}>
                  {m} <button onClick={() => removeMeasurement(m)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'red',
                      marginLeft: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                    >x</button>
                </li>
              ))
            )}
          </ul>
        </div>
    );
}
