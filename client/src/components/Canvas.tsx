import { useRef, useState } from "react";
import { Stage, Layer, Rect, Image as KonvaImage, Transformer } from "react-konva";
import { useDrop } from "react-dnd";
import { useStore } from "@/store/editorStore";
import { Asset, CanvasElement } from "@/lib/types";
import useImage from "use-image";
import { 
  FaSearchMinus, 
  FaSearchPlus, 
  FaExpand, 
  FaUndo, 
  FaRedo,
  FaEye,
  FaRulerCombined,
  FaThLarge
} from "react-icons/fa";
import { Button } from "@/components/ui/button";

// Custom element component with event handling
const CanvasElementComponent = ({ 
  element, 
  isSelected, 
  onSelect, 
  onChange 
}: { 
  element: CanvasElement, 
  isSelected: boolean, 
  onSelect: () => void,
  onChange: (newProps: Partial<CanvasElement>) => void
}) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);
  const [image] = useImage(element.src);
  
  // Update transformer on selection change
  if (isSelected && trRef.current) {
    trRef.current.nodes([shapeRef.current]);
    trRef.current.getLayer().batchDraw();
  }
  
  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            x: e.target.x(),
            y: e.target.y()
          });
        }}
        onTransformEnd={() => {
          // Get transformer node
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          
          // Reset scale and update width/height
          node.scaleX(1);
          node.scaleY(1);
          
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize to reasonable values
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default function Canvas() {
  const stageRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const { 
    tankDimensions, 
    elements, 
    selectedElement, 
    setSelectedElement, 
    addElement, 
    updateElement,
    undo,
    redo,
    canUndo,
    canRedo
  } = useStore();
  
  // Calculate stage dimensions based on tank dimensions and a scale factor
  const scaleFactor = 10; // 1cm = 10px
  const stageWidth = tankDimensions.width * scaleFactor;
  const stageHeight = tankDimensions.height * scaleFactor;
  const substrateHeight = 50; // Height of substrate in pixels
  
  // Setup drop target for drag and drop
  const [, drop] = useDrop({
    accept: 'ASSET',
    drop: (item: Asset, monitor) => {
      const dropPosition = monitor.getClientOffset();
      if (!dropPosition || !stageRef.current) return;
      
      const stageBox = stageRef.current.container().getBoundingClientRect();
      const stagePos = {
        x: (dropPosition.x - stageBox.left) / scale,
        y: (dropPosition.y - stageBox.top) / scale
      };
      
      // Create a new element
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: item.category,
        name: item.name,
        src: item.src,
        x: stagePos.x,
        y: stagePos.y,
        width: item.defaultWidth || 100,
        height: item.defaultHeight || 100,
        rotation: 0,
        depth: 'middle',
      };
      
      addElement(newElement);
      setSelectedElement(newElement.id);
    }
  });
  
  const handleElementSelect = (id: string) => {
    setSelectedElement(id);
  };
  
  const handleElementChange = (id: string, newProps: Partial<CanvasElement>) => {
    updateElement(id, newProps);
  };
  
  const handleStageClick = (e: any) => {
    // Deselect when clicking on empty canvas area
    if (e.target === e.target.getStage()) {
      setSelectedElement(null);
    }
  };
  
  // Zoom controls
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.3));
  };
  
  const resetZoom = () => {
    setScale(1);
  };
  
  return (
    <main className="flex-1 relative overflow-hidden bg-gray-100 flex items-center justify-center" ref={drop}>
      {/* Canvas Grid Background */}
      <div className="absolute inset-0 bg-grid opacity-50"></div>
      
      {/* Tank Canvas */}
      <div className="relative" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Tank Background */}
            <Rect
              x={0}
              y={0}
              width={stageWidth}
              height={stageHeight}
              fill="#fff"
              stroke="#ddd"
              strokeWidth={2}
              cornerRadius={5}
            />
            
            {/* Tank Wall Glow */}
            <Rect
              x={2}
              y={2}
              width={stageWidth - 4}
              height={stageHeight - 4}
              fill="transparent"
              stroke="rgba(44, 123, 191, 0.1)"
              strokeWidth={8}
              cornerRadius={4}
            />
            
            {/* Substrate */}
            <Rect
              x={0}
              y={stageHeight - substrateHeight}
              width={stageWidth}
              height={substrateHeight}
              fill="#E9DAC1"
              cornerRadius={[0, 0, 5, 5]}
            />
            
            {/* Render Elements */}
            {elements.map(element => (
              <CanvasElementComponent
                key={element.id}
                element={element}
                isSelected={selectedElement === element.id}
                onSelect={() => handleElementSelect(element.id)}
                onChange={(newProps) => handleElementChange(element.id, newProps)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
      
      {/* Canvas Toolbar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
          onClick={zoomOut}
        >
          <FaSearchMinus />
        </Button>
        <div className="px-2 text-sm">{Math.round(scale * 100)}%</div>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
          onClick={zoomIn}
        >
          <FaSearchPlus />
        </Button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
          onClick={resetZoom}
        >
          <FaExpand />
        </Button>
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
          onClick={undo}
          disabled={!canUndo}
        >
          <FaUndo />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
          onClick={redo}
          disabled={!canRedo}
        >
          <FaRedo />
        </Button>
      </div>
      
      {/* Quick Actions */}
      <div className="absolute top-5 right-5 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-ui-dark border border-gray-200"
        >
          <FaEye />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-ui-dark border border-gray-200"
        >
          <FaRulerCombined />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-ui-dark border border-gray-200"
        >
          <FaThLarge />
        </Button>
      </div>
    </main>
  );
}
