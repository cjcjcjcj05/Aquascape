import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import PropertyPanel from "@/components/PropertyPanel";
import { useStore } from "@/store/editorStore";

export default function Editor() {
  const selectedElement = useStore(state => state.selectedElement);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  
  return (
    <div className="h-full flex overflow-hidden">
      <Sidebar />
      <Canvas />
      {selectedElement && isPropertiesPanelOpen && <PropertyPanel />}
    </div>
  );
}
