// realtime/SavedClasses/index.tsx
import React from 'react';
import {SavedClassesList} from './SavedClassesList';
import {SavedClassGraph} from './SavedClassesGraph';
import {SavedClassIndividualGraph} from './SavedClassIndividualGraph'
import { useInfluxStore } from '../../store/useInfluxStore';

export default function SavedClassesPanel() {
  const savedClassTimeseriesData = useInfluxStore((s) => s.savedClassTimeseriesData);

  const hasData = savedClassTimeseriesData.length > 0;

  return (
      <div className="realtime-manager" style={styles.manager}>
        {/* Sidebar */}
        <div className="sidebar" style={styles.sidebar}>
          <SavedClassesList />
        </div>
  
        {/* Graphs */}
        <div className="graphs" style={styles.graphs}>
          {hasData ? (
            <>
              <SavedClassGraph />
              {savedClassTimeseriesData.length > 1 && (
                <div className="graphs-grid" style={styles.graphsGrid}>
                  {savedClassTimeseriesData.map((ts) => (
                    <SavedClassIndividualGraph key={ts.measurement} data={ts} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.placeholder}>
              No measurement selected. Please select measurement to display data.
            </div>
          )}
        </div>
      </div>
    );
  }
  
  


const styles = {
  manager: {
    display: "flex",
    flexDirection: "row",
    gap: "2rem",
    padding: "1rem",
    maxWidth: "1500px",
    margin: "0 auto",
  },
  sidebar: {
    flex: "0 0 400px",
    display: "flex",
    flexDirection: "column",
    // gap: "1rem",
    backgroundColor: "#1c1c1c",
    padding: "1rem",
    color: "#fff",
    height: "fit-content",
    borderRight: '1px solid #444',
  },
  graphs: {
    flex: "1",
    display: "flex",
    minWidth: 0,  
    flexDirection: "column",
    gap: "0rem",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "300px",
    backgroundColor: "#111",
    color: "#aaa",
  },
  graphsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
    width: "100%",
  },
  placeholder: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#777",
  },
};
