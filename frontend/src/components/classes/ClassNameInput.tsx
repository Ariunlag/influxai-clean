import { useInfluxStore } from "../../store/useInfluxStore";

export default function ClassNameInput() {
    const {classNameInput, setClassNameInput, saveClass } = useInfluxStore();

    return (
        <div>
            <h4>To save class</h4>
            <input
                type="text"
                value={classNameInput}
                onChange={(e) => setClassNameInput(e.target.value)}
                placeholder="Enter class name"
                style={{ padding: "0.5rem", width: "95%", marginRight: "0.5rem", borderRadius: "4px", backgroundColor: '#1c1c1c', }}
            />
            <button
                onClick={saveClass}
                style={{ marginTop: "0.5rem", padding: "0.5rem 1rem", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "2px" }}
            >
                Save Class
            </button>
        </div>
    );
}