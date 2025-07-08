// realtime/SavedClasses/SavedClassesList.tsx
import { useEffect } from 'react';
import { useInfluxStore } from '../../store/useInfluxStore';

export const SavedClassesList = () => {
  const classes = useInfluxStore((state) => state.classes);
  const getClasses = useInfluxStore((state) => state.getClasses);
  const setSelectedClass = useInfluxStore((state) => state.setSelectedClass);
  const clearSelectedClass = useInfluxStore((state) => state.clearSelectedClass);
  const selectedClass = useInfluxStore((state) => state.selectedClass);
  const deleteClass = useInfluxStore((state) => state.deleteClass);

  useEffect(() => {
    getClasses();
  }, [getClasses]);

  if (!classes || classes.length === 0) {
    return <div>No saved classes yet.</div>;
  }

  const handleDelete = () => {
    if (selectedClass) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${selectedClass.name}"?`
      );
      if (confirmed) {
        deleteClass();
        clearSelectedClass();
      }
    }
  };

  return (
    <div>
      <h4>Available classes</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {classes.map((classItem) => (
          <li
            key={classItem.name}
            onClick={() => setSelectedClass(classItem)}
            style={{
              padding: '4px 0',
              cursor: 'pointer',
              fontWeight:
                selectedClass?.name === classItem.name ? 'bold' : 'normal',
            }}
          >
            {classItem.name}
          </li>
        ))}
      </ul>

      {selectedClass && (
        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleDelete}>
            Delete "{selectedClass.name}"
          </button>{' '}
          <button onClick={() => clearSelectedClass()}>Clear Selection</button>
        </div>
      )}
    </div>
  );
};
