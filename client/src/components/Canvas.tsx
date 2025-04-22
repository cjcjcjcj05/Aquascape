import { useRef, useState, useEffect } from "react";
import { 
  Stage, 
  Layer, 
  Rect, 
  Image as KonvaImage, 
  Transformer, 
  Line,
  Shape
} from "react-konva";
import { useDrop } from "react-dnd";
import { useStore } from "@/store/editorStore";
import { Asset, CanvasElement, ElevationPoint } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import useImage from "use-image";
import { getVariantColor } from "@/lib/substrateData";
import { 
  FaSearchMinus, 
  FaSearchPlus, 
  FaExpand, 
  FaUndo, 
  FaRedo,
  FaEye,
  FaRulerCombined,
  FaThLarge,
  FaTrashAlt
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

// Custom element component with event handling
// Fallback image for when loading fails
const fallbackImage = new window.Image(100, 100);
fallbackImage.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30,30 L70,70 M30,70 L70,30' stroke='%23d1d5db' stroke-width='5'/%3E%3C/svg%3E";

// Custom hook for safe image loading
const useSafeImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  
  useEffect(() => {
    // Create a new image object
    const img = new window.Image();
    
    // Set up load and error handlers
    img.onload = () => {
      // Only set the image if it has valid dimensions
      if (img.width > 0 && img.height > 0) {
        setImage(img);
        setStatus('loaded');
      } else {
        console.error(`Invalid image dimensions for ${src}: ${img.width}x${img.height}`);
        setImage(fallbackImage);
        setStatus('failed');
      }
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setImage(fallbackImage);
      setStatus('failed');
    };
    
    // Start loading
    img.src = src;
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);
  
  return { image, status };
};

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
  
  // Fix image loading by ensuring the path is correct
  const imagePath = element.src.startsWith('/') 
    ? element.src 
    : `/${element.src}`;
    
  // Use our safe image loading hook
  const { image, status } = useSafeImage(imagePath);
  
  // Update transformer on selection change
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      // Attach transformer to selected element
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  // Return a placeholder rectangle while the image is loading
  if (status === 'loading' || !image) {
    // Ensure we have valid dimensions for the placeholder
    const width = Math.max(10, element.width || 100);
    const height = Math.max(10, element.height || 100);
    
    return (
      <Rect
        x={element.x}
        y={element.y}
        width={width}
        height={height}
        fill="#d1d5db"
        opacity={0.6}
        stroke="#9ca3af"
        strokeWidth={1}
        cornerRadius={3}
        draggable
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
      />
    );
  }
  
  // Ensure we have valid dimensions (prevent zero width/height)
  const width = Math.max(10, element.width || 100);
  const height = Math.max(10, element.height || 100);
  
  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={element.x}
        y={element.y}
        width={width}
        height={height}
        rotation={element.rotation}
        draggable
        onClick={(e) => {
          // Stop event propagation to prevent stage onClick from firing
          e.cancelBubble = true;
          onSelect();
        }}
        onTap={(e) => {
          // Stop event propagation for touch events too
          e.cancelBubble = true;
          onSelect();
        }}
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
  const { toast } = useToast();
  const { 
    tankDimensions, 
    elements, 
    selectedElement, 
    setSelectedElement, 
    addElement, 
    updateElement,
    removeElement,
    clearAllElements,
    undo,
    redo,
    canUndo,
    canRedo,
    substrateSettings
  } = useStore();
  
  // Handle keyboard events for delete, arrow navigation, and other operations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
        removeElement(selectedElement);
        toast({
          title: "Element deleted",
          description: "The selected element has been removed"
        });
      } 
      // Undo operation
      else if (e.ctrlKey && e.key === 'z') {
        if (canUndo) undo();
      } 
      // Redo operation
      else if (e.ctrlKey && e.key === 'y') {
        if (canRedo) redo();
      }
      // Arrow keys to navigate between elements of the same type
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && selectedElement) {
        const currentElement = elements.find(el => el.id === selectedElement);
        if (currentElement) {
          // Get all elements of the same name
          const sameTypeElements = elements.filter(el => el.name === currentElement.name);
          
          if (sameTypeElements.length > 1) {
            // Find the current index
            const currentIndex = sameTypeElements.findIndex(el => el.id === selectedElement);
            let nextIndex;
            
            if (e.key === 'ArrowRight') {
              // Move to next element (or wrap around to the first)
              nextIndex = (currentIndex + 1) % sameTypeElements.length;
            } else {
              // Move to previous element (or wrap to the last)
              nextIndex = (currentIndex - 1 + sameTypeElements.length) % sameTypeElements.length;
            }
            
            // Select the next/previous element
            setSelectedElement(sameTypeElements[nextIndex].id);
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, elements, removeElement, toast, undo, redo, canUndo, canRedo, setSelectedElement]);
  
  // Calculate stage dimensions based on tank dimensions and a scale factor
  const scaleFactor = 10; // 1cm = 10px
  const stageWidth = tankDimensions.width * scaleFactor;
  const stageHeight = tankDimensions.height * scaleFactor;
  
  // Generate substrate points for the shape
  const calculateSubstratePoints = (): number[] => {
    const baseHeight = (substrateSettings.baseHeight / 100) * stageHeight;
    const sortedPoints = [...substrateSettings.elevationPoints].sort((a, b) => a.x - b.x);
    
    // Start with bottom left
    let points: number[] = [0, stageHeight];
    
    // Add elevation points
    sortedPoints.forEach(point => {
      const x = (point.x / 100) * stageWidth;
      const y = stageHeight - baseHeight - ((point.y / 100) * baseHeight);
      points.push(x, y);
    });
    
    // Add bottom right and close the shape
    points.push(stageWidth, stageHeight);
    
    return points;
  };
  
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
            
            {/* Substrate with elevation */}
            <Shape
              sceneFunc={(context, shape) => {
                // Calculate substrate points
                const points = calculateSubstratePoints();
                context.beginPath();
                context.moveTo(points[0], points[1]);
                
                for (let i = 2; i < points.length; i += 2) {
                  context.lineTo(points[i], points[i + 1]);
                }
                
                context.closePath();
                context.fillStrokeShape(shape);
              }}
              fill={getVariantColor(substrateSettings.typeId, substrateSettings.variantId)}
              stroke="#a18a68"
              strokeWidth={1}
              shadowColor="rgba(0, 0, 0, 0.1)"
              shadowBlur={5}
              shadowOffset={{ x: 0, y: -1 }}
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
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
            onClick={zoomOut}
          >
            <FaSearchMinus />
          </Button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Zoom Out
          </div>
        </div>
        
        <div className="px-2 text-sm">{Math.round(scale * 100)}%</div>
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
            onClick={zoomIn}
          >
            <FaSearchPlus />
          </Button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Zoom In
          </div>
        </div>
        
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
            onClick={resetZoom}
          >
            <FaExpand />
          </Button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Reset Zoom
          </div>
        </div>
        
        <div className="h-4 w-px bg-gray-200 mx-1"></div>
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
            onClick={undo}
            disabled={!canUndo}
          >
            <FaUndo />
          </Button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Undo
          </div>
        </div>
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-gray-100 text-ui-dark"
            onClick={redo}
            disabled={!canRedo}
          >
            <FaRedo />
          </Button>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Redo
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="absolute top-5 right-5 flex flex-col space-y-2">
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-ui-dark border border-gray-200"
            onClick={() => {
              // Toggle between wireframe and preview mode in the future
              toast({
                title: "Preview Mode",
                description: "Preview mode will be available in the next version.",
              });
            }}
          >
            <FaEye />
          </Button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Preview Mode
          </div>
        </div>
        
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-ui-dark border border-gray-200"
            onClick={() => {
              // Toggle measurement tools in the future
              toast({
                title: "Measurement Tools",
                description: "Measurement tools will be available in the next version.",
              });
            }}
          >
            <FaRulerCombined />
          </Button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Measurement Tools
          </div>
        </div>
        
        <div className="relative group">
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-ui-dark border border-gray-200"
            onClick={() => {
              // Toggle grid visibility in the future
              toast({
                title: "Toggle Grid",
                description: "Grid visibility control will be available in the next version.",
              });
            }}
          >
            <FaThLarge />
          </Button>
          <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Toggle Grid
          </div>
        </div>
        
        {/* Clear All Button with Confirmation Dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="relative group">
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-md bg-white hover:bg-gray-100 text-red-500 border border-gray-200"
              >
                <FaTrashAlt />
              </Button>
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                Clear All
              </div>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all elements from your aquascape. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  clearAllElements();
                  toast({
                    title: "Cleared All Elements",
                    description: "All elements have been removed from your aquascape.",
                  });
                }}
              >
                Clear All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
