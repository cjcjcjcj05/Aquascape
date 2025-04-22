import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TankDimensions } from "@/lib/types";
import { useState, useEffect } from "react";
import { tankPresets } from "@/lib/tankPresets";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TankDimensionsProps {
  dimensions: TankDimensions;
  onChange: (dimensions: TankDimensions) => void;
}

// Conversion constants
const INCH_TO_CM = 2.54;
const CM_TO_INCH = 1 / INCH_TO_CM;
const GALLON_TO_LITER = 3.78541;

export default function TankDimensionsForm({ dimensions, onChange }: TankDimensionsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Imperial unit state (inches)
  const [imperialDimensions, setImperialDimensions] = useState({
    width: Math.round(dimensions.width * CM_TO_INCH * 10) / 10,
    depth: Math.round(dimensions.depth * CM_TO_INCH * 10) / 10,
    height: Math.round(dimensions.height * CM_TO_INCH * 10) / 10
  });
  
  // Update imperial units when metric dimensions change
  useEffect(() => {
    const newImperialDimensions = {
      width: Math.round(dimensions.width * CM_TO_INCH * 10) / 10,
      depth: Math.round(dimensions.depth * CM_TO_INCH * 10) / 10,
      height: Math.round(dimensions.height * CM_TO_INCH * 10) / 10
    };
    setImperialDimensions(newImperialDimensions);
    
    // Update selected preset if dimensions match a preset
    const matchingPreset = tankPresets.find(preset => 
      Math.abs(preset.width - newImperialDimensions.width) < 0.1 &&
      Math.abs(preset.height - newImperialDimensions.height) < 0.1 &&
      Math.abs(preset.depth - newImperialDimensions.depth) < 0.1
    );
    setSelectedPreset(matchingPreset?.name || null);
  }, [dimensions]);
  
  const handleImperialChange = (field: keyof TankDimensions, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      // Update imperial state
      setImperialDimensions({
        ...imperialDimensions,
        [field]: numValue
      });
      
      // Convert to metric and update parent state
      onChange({
        ...dimensions,
        [field]: Math.round(numValue * INCH_TO_CM)
      });
      
      // Clear selected preset when manually changing dimensions
      setSelectedPreset(null);
    }
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = tankPresets.find(p => p.name === presetName);
    if (preset) {
      // Convert preset inches to centimeters for the store
      onChange({
        width: Math.round(preset.width * INCH_TO_CM),
        height: Math.round(preset.height * INCH_TO_CM),
        depth: Math.round(preset.depth * INCH_TO_CM)
      });
      setSelectedPreset(presetName);
    }
  };
  
  // Calculate volume in gallons
  const volumeGallons = (dimensions.width * dimensions.depth * dimensions.height) / 1000 / GALLON_TO_LITER;
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-ui-dark">Tank Dimensions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 h-6"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <>
          <div className="mb-4">
            <Label className="block text-xs text-ui-light mb-1">Preset Sizes</Label>
            <Select value={selectedPreset || ""} onValueChange={handlePresetSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a standard size..." />
              </SelectTrigger>
              <SelectContent>
                {tankPresets.map(preset => (
                  <SelectItem key={preset.name} value={preset.name}>
                    {preset.name} ({preset.width}×{preset.height}×{preset.depth}")
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="block text-xs text-ui-light mb-1">Width</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={imperialDimensions.width.toFixed(1)} 
                  onChange={(e) => handleImperialChange('width', e.target.value)}
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm" 
                />
                <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">in</span>
              </div>
            </div>
            <div>
              <Label className="block text-xs text-ui-light mb-1">Depth</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={imperialDimensions.depth.toFixed(1)} 
                  onChange={(e) => handleImperialChange('depth', e.target.value)}
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm" 
                />
                <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">in</span>
              </div>
            </div>
            <div>
              <Label className="block text-xs text-ui-light mb-1">Height</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={imperialDimensions.height.toFixed(1)} 
                  onChange={(e) => handleImperialChange('height', e.target.value)}
                  step="0.1"
                  min="0"
                  className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm" 
                />
                <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">in</span>
              </div>
            </div>
            <div>
              <Label className="block text-xs text-ui-light mb-1">Volume</Label>
              <div className="flex">
                <Input 
                  type="number" 
                  value={volumeGallons.toFixed(1)}
                  disabled
                  className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm bg-gray-50" 
                />
                <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">gal</span>
              </div>
            </div>
          </div>

          <div className="mt-2 text-xs text-ui-light">
            Metric: {dimensions.width}×{dimensions.height}×{dimensions.depth}cm
          </div>
        </>
      )}
    </div>
  );
}
