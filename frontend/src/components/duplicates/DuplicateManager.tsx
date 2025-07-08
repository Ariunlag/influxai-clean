// src/components/duplicates/DuplicateManager.tsx
import React from "react";
import { useDuplicateWebSocket } from "../../hooks/useDuplicateWebSocket";
import DuplicatePanel from "./DuplicatePanel";

const DuplicateManager: React.FC = () => {
  useDuplicateWebSocket();
  return (
    <DuplicatePanel/>
  );
};

export default DuplicateManager;
