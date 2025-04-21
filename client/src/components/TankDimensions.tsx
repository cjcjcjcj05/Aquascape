import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TankDimensions } from "@/lib/types";

interface TankDimensionsProps {
  dimensions: TankDimensions;
  onChange: (dimensions: TankDimensions) => void;
}

export default function TankDimensionsForm({ dimensions, onChange }: TankDimensionsProps) {
  const handleChange = (field: keyof TankDimensions, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0) {
      onChange({
        ...dimensions,
        [field]: numValue
      });
    }
  };
  
  // Calculate volume in gallons (dimensions are in inches)
  const volumeGallons = (dimensions.width * dimensions.depth * dimensions.height) / 231;
  
  return (
    <div className="bg-gray-50 p-3 rounded-lg">
      <h3 className="text-sm font-medium text-ui-dark mb-2">Tank Dimensions</h3>
      <div className="flex space-x-2 mb-2">
        <div className="flex-1">
          <Label className="block text-xs text-ui-light mb-1">Width</Label>
          <div className="flex">
            <Input 
              type="number" 
              value={dimensions.width} 
              onChange={(e) => handleChange('width', e.target.value)}
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
              value={dimensions.depth} 
              onChange={(e) => handleChange('depth', e.target.value)}
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
              value={dimensions.height} 
              onChange={(e) => handleChange('height', e.target.value)}
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
