import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import PropertyPanel from "@/components/PropertyPanel";
import { useStore } from "@/store/editorStore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Design } from "@shared/schema";

export default function Editor() {
  const selectedElement = useStore(state => state.selectedElement);
  const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Get design ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const designId = urlParams.get('design');
  
  // Set up state for the editor
  const setTankDimensions = useStore(state => state.setTankDimensions);
  const clearAllElements = useStore(state => state.clearAllElements);
  const addElement = useStore(state => state.addElement);
  
  // Fetch design data if we have an ID
  const { data: design, isLoading } = useQuery<Design>({
    queryKey: ['/api/designs', designId],
    enabled: !!designId,
  });
  
  // Load design when data is fetched
  useEffect(() => {
    if (design) {
      try {
        // Clear the canvas
        clearAllElements();
        
        // Set tank dimensions
        setTankDimensions({
          width: design.width,
          height: design.height,
          depth: design.depth
        });
        
        // Add all elements
        if (Array.isArray(design.elements)) {
          design.elements.forEach(element => {
            addElement(element);
          });
        }
        
        toast({
          title: "Design Loaded",
          description: `"${design.name}" has been loaded successfully.`,
        });
      } catch (error) {
        console.error("Error loading design:", error);
        toast({
          title: "Error Loading Design",
          description: "There was an error loading the design. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [design, clearAllElements, setTankDimensions, addElement, toast]);
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading your design...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex overflow-hidden">
      <Sidebar />
      <Canvas />
      {selectedElement && isPropertiesPanelOpen && <PropertyPanel />}
    </div>
  );
}
