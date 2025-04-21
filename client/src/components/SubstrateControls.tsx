import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/editorStore";
import { ElevationPoint, SubstrateSettings } from "@/lib/types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorSwatch } from "./ColorSwatch";

const substrateColors = {
  sand: [
    { name: "Sand Bright", color: "#E9DAC1" },
    { name: "Sand Nature", color: "#D4BC94" },
  ],
  gravel: [
    { name: "Gravel Gray", color: "#C4C4C4" },
    { name: "Gravel Nature", color: "#C2B280" },
    { name: "Gravel Nature Grained", color: "#B8A378" },
    { name: "Gravel Nature Bright", color: "#D6C49B" },
  ],
  soil: [
    { name: "Aqua Soil Dark", color: "#4D3B27" },
    { name: "Aqua Soil Black", color: "#1E1E1E" },
  ],
};

export function SubstrateControls() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const {
    substrateSettings,
    tankDimensions,
    setSubstrateType,
    setSubstrateColor,
    setSubstrateBaseHeight,
    addElevationPoint,
    updateElevationPoint,
    removeElevationPoint,
  } = useStore();

  const handleBaseHeightChange = (value: number[]) => {
    setSubstrateBaseHeight(value[0]);
  };

  const handleColorSelect = (color: string) => {
    setSubstrateColor(color);
  };

  // Handle canvas interactions for elevation points
  const handleCanvasMouseDown = (event: React.MouseEvent, pointId?: string) => {
    if (pointId) {
      setActivePoint(pointId);
    } else {
      // Calculate coordinates relative to canvas
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((rect.bottom - event.clientY) / rect.height) * 100;
      
      // Add new point at this position
      addElevationPoint({ x, y });
    }
    
    setIsDragging(true);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent) => {
    if (!isDragging || !activePoint || !canvasRef.current) return;
    
    // Calculate new position
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((rect.bottom - event.clientY) / rect.height) * 100));
    
    // Update point position
    updateElevationPoint(activePoint, { x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
    setActivePoint(null);
  };

  const handleRemovePoint = (id: string) => {
    removeElevationPoint(id);
  };

  // Sort points by x coordinate for proper drawing
  const sortedPoints = [...substrateSettings.elevationPoints].sort((a, b) => a.x - b.x);

  // Generate SVG path data from elevation points
  const createPathFromPoints = (points: ElevationPoint[], tankHeight: number): string => {
    if (points.length < 2) return "";
    
    // Scale points to canvas size
    const scaledPoints = points.map(point => ({
      x: (point.x / 100) * 100, // Scale to canvas width
      y: 100 - (point.y / 100) * 100 // Scale and invert for SVG coordinates
    }));
    
    // Start at the bottom left
    let path = `M 0,100 L ${scaledPoints[0].x},${scaledPoints[0].y}`;
    
    // Add each point
    for (let i = 1; i < scaledPoints.length; i++) {
      path += ` L ${scaledPoints[i].x},${scaledPoints[i].y}`;
    }
    
    // Close the path: go to bottom right, then bottom left
    path += ` L 100,100 L 0,100 Z`;
    
    return path;
  };

  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setActivePoint(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <Tabs defaultValue="type">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="type">Type</TabsTrigger>
        <TabsTrigger value="height">Height</TabsTrigger>
        <TabsTrigger value="elevation">Elevation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="type" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Substrate Type</CardTitle>
            <CardDescription>
              Choose the substrate type and color for your aquarium.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Sand</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {substrateColors.sand.map(substrate => (
                    <ColorSwatch
                      key={substrate.name}
                      name={substrate.name}
                      color={substrate.color}
                      selected={substrateSettings.color === substrate.color}
                      onClick={() => handleColorSelect(substrate.color)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Gravel</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {substrateColors.gravel.map(substrate => (
                    <ColorSwatch
                      key={substrate.name}
                      name={substrate.name}
                      color={substrate.color}
                      selected={substrateSettings.color === substrate.color}
                      onClick={() => handleColorSelect(substrate.color)}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Aqua Soil</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {substrateColors.soil.map(substrate => (
                    <ColorSwatch
                      key={substrate.name}
                      name={substrate.name}
                      color={substrate.color}
                      selected={substrateSettings.color === substrate.color}
                      onClick={() => handleColorSelect(substrate.color)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="height">
        <Card>
          <CardHeader>
            <CardTitle>Base Height</CardTitle>
            <CardDescription>
              Adjust the base height of your substrate layer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Height</Label>
                  <span className="text-sm text-muted-foreground">
                    {substrateSettings.baseHeight}%
                  </span>
                </div>
                <Slider
                  value={[substrateSettings.baseHeight]}
                  min={5}
                  max={60}
                  step={1}
                  onValueChange={handleBaseHeightChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="elevation">
        <Card>
          <CardHeader>
            <CardTitle>Elevation Profile</CardTitle>
            <CardDescription>
              Create elevation by dragging points or clicking to add new control points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              ref={canvasRef}
              className="w-full h-48 bg-slate-50 border rounded-md relative mb-2"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            >
              {/* Elevation graph */}
              <svg className="w-full h-full">
                {/* Tank outline */}
                <rect x="0" y="0" width="100%" height="100%" fill="transparent" stroke="#d0d0d0" strokeWidth="1" />
                
                {/* Water level line */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#81c8ee" strokeWidth="1" strokeDasharray="4 2" />
                
                {/* Substrate shape */}
                <path
                  d={createPathFromPoints(sortedPoints, 100)}
                  fill={substrateSettings.color}
                  stroke="#a18a68"
                  strokeWidth="1"
                />
                
                {/* Control points */}
                {sortedPoints.map(point => (
                  <g key={point.id}>
                    <circle
                      cx={`${point.x}%`}
                      cy={`${100 - point.y}%`}
                      r="6"
                      fill="white"
                      stroke="#666"
                      strokeWidth="2"
                      style={{ cursor: 'move' }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleCanvasMouseDown(e, point.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleRemovePoint(point.id);
                      }}
                    />
                  </g>
                ))}
              </svg>

              {/* Instructions */}
              <div className="absolute bottom-2 right-2 text-xs text-slate-500">
                Click to add points • Double-click to remove • Drag to move
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}