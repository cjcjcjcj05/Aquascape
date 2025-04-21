import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TankDimensions } from "@/lib/types";
import { useState, useEffect } from "react";

interface TankDimensionsProps {
  dimensions: TankDimensions;
  onChange: (dimensions: TankDimensions) => void;
}

// Conversion constants
const INCH_TO_CM = 2.54;
const CM_TO_INCH = 1 / INCH_TO_CM;
const GALLON_TO_LITER = 3.78541;

export default function TankDimensionsForm({ dimensions, onChange }: TankDimensionsProps) {
  // Imperial unit state (inches)
  const [imperialDimensions, setImperialDimensions] = useState({
    width: Math.round(dimensions.width * CM_TO_INCH * 10) / 10,
    depth: Math.round(dimensions.depth * CM_TO_INCH * 10) / 10,
    height: Math.round(dimensions.height * CM_TO_INCH * 10) / 10
  });
  
  // Update imperial units when metric dimensions change
  useEffect(() => {
    setImperialDimensions({
      width: Math.round(dimensions.width * CM_TO_INCH * 10) / 10,
      depth: Math.round(dimensions.depth * CM_TO_INCH * 10) / 10,
      height: Math.round(dimensions.height * CM_TO_INCH * 10) / 10
    });
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
    }
  };
  
  // Calculate volume in gallons
  const volumeGallons = (dimensions.width * dimensions.depth * dimensions.height) / 1000 / GALLON_TO_LITER;
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <h3 className="text-sm font-medium text-ui-dark mb-2">Tank Dimensions</h3>
      <div className="flex space-x-2 mb-2">
        <div className="flex-1">
          <Label className="block text-xs text-ui-light mb-1">Width</Label>
          <div className="flex">
            <Input 
              type="number" 
              value={imperialDimensions.width.toFixed(1)} 
              onChange={(e) => handleImperialChange('width', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm" 
            />
            <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">in</span>
          </div>
        </div>
        <div className="flex-1">
          <Label className="block text-xs text-ui-light mb-1">Depth</Label>
          <div className="flex">
            <Input 
              type="number" 
              value={imperialDimensions.depth.toFixed(1)} 
              onChange={(e) => handleImperialChange('depth', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm" 
            />
            <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">in</span>
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <div className="flex-1">
          <Label className="block text-xs text-ui-light mb-1">Height</Label>
          <div className="flex">
            <Input 
              type="number" 
              value={imperialDimensions.height.toFixed(1)} 
              onChange={(e) => handleImperialChange('height', e.target.value)}
              step="0.1"
              className="w-full px-2 py-1 border border-gray-300 rounded-l text-sm" 
            />
            <span className="bg-gray-100 text-ui-light px-2 py-1 text-xs flex items-center border border-l-0 border-gray-300 rounded-r">in</span>
          </div>
        </div>
        <div className="flex-1">
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
    </div>
  );
}
