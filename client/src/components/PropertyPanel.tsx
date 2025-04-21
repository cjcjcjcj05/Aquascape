import { useState, useEffect } from "react";
import { useStore } from "@/store/editorStore";
import { FaCopy, FaTrashAlt, FaLayerGroup, FaThLarge, FaObjectGroup } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { CanvasElement, Asset } from "@/lib/types";
import { SubstrateControls } from "@/components/SubstrateControls";
import { getAssetById, getAssetsByCategory } from "@/lib/assetData";

export default function PropertyPanel() {
  const selectedElementId = useStore(state => state.selectedElement);
  const elements = useStore(state => state.elements);
  const updateElement = useStore(state => state.updateElement);
  const duplicateElement = useStore(state => state.duplicateElement);
  const removeElement = useStore(state => state.removeElement);
  const createCarpet = useStore(state => state.createCarpet);
  const selectAllOfType = useStore(state => state.selectAllOfType);
  
  const selectedElement = elements.find(el => el.id === selectedElementId);
  
  if (!selectedElement) {
    return (
      <aside className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-poppins font-semibold text-lg flex items-center">
            <span className="mr-2 text-accent"><FaLayerGroup /></span>
            Substrate Controls
          </h2>
        </div>
        
        <div className="p-4">
          <SubstrateControls />
        </div>
      </aside>
    );
  }
  
  // Check if the selected element is a carpeting plant
  // Get all plants and find the one matching the selected element's name
  const allPlants = getAssetsByCategory('plants');
  const asset = selectedElement.type === 'plants' 
    ? allPlants.find((a: Asset) => a.name === selectedElement.name) 
    : null;
  
  // Check if this plant is a carpeting plant
  const isCarpetingPlant = asset?.isCarpeting || false;
  
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'substrate':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>;
      case 'hardscape':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>;
      case 'plants':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>;
      case 'fish':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>;
      default:
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>;
    }
  };
  
  const handleInputChange = (property: keyof CanvasElement, value: any) => {
    updateElement(selectedElement.id, { [property]: value });
  };
  
  const iconStyle = "mr-2 text-accent";
  
  return (
    <aside className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-poppins font-semibold text-lg flex items-center">
          <span className={iconStyle}>{getElementIcon(selectedElement.type)}</span>
          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
        </h2>
      </div>
      
      <div className="p-4">
        {/* Element Preview */}
        <div className="mb-4">
          <div className="aspect-square bg-gray-50 rounded-md flex items-center justify-center overflow-hidden border border-gray-200">
            <img src={selectedElement.src} alt={selectedElement.name} className="max-w-full max-h-full object-contain" />
          </div>
          <p className="text-center text-sm font-medium mt-2">{selectedElement.name}</p>
        </div>
        
        {/* Properties */}
        <div className="space-y-4">
          {/* Position */}
          <div>
            <h3 className="font-medium text-sm mb-2">Position</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-ui-light mb-1">X</label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.x)}
                  onChange={(e) => handleInputChange('x', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ui-light mb-1">Y</label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.y)}
                  onChange={(e) => handleInputChange('y', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Size */}
          <div>
            <h3 className="font-medium text-sm mb-2">Size</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-ui-light mb-1">Width</label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.width)}
                  onChange={(e) => handleInputChange('width', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ui-light mb-1">Height</label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.height)}
                  onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Rotation */}
          <div>
            <h3 className="font-medium text-sm mb-2">Rotation</h3>
            <Slider
              defaultValue={[selectedElement.rotation]}
              max={360}
              step={1}
              onValueChange={(value) => handleInputChange('rotation', value[0])}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-ui-light mt-1">
              <span>0°</span>
              <span>180°</span>
              <span>360°</span>
            </div>
          </div>
          
          {/* Depth */}
          <div>
            <h3 className="font-medium text-sm mb-2">Depth</h3>
            <div className="flex">
              <button 
                className={`flex-1 py-1 border border-r-0 border-gray-300 rounded-l text-sm ${selectedElement.depth === 'front' ? 'bg-[#9BE36D]' : 'bg-gray-50'}`}
                onClick={() => handleInputChange('depth', 'front')}
              >
                Front
              </button>
              <button 
                className={`flex-1 py-1 border border-gray-300 text-sm ${selectedElement.depth === 'middle' ? 'bg-[#9BE36D]' : 'bg-gray-50'}`}
                onClick={() => handleInputChange('depth', 'middle')}
              >
                Middle
              </button>
              <button 
                className={`flex-1 py-1 border border-l-0 border-gray-300 rounded-r text-sm ${selectedElement.depth === 'back' ? 'bg-[#9BE36D]' : 'bg-gray-50'}`}
                onClick={() => handleInputChange('depth', 'back')}
              >
                Back
              </button>
            </div>
          </div>
        </div>
        
        {/* Plant options */}
        {selectedElement.type === 'plants' && (
          <div className="mt-4">
            <h3 className="font-medium text-sm mb-2">
              {isCarpetingPlant ? "Carpeting Options" : "Plant Options"}
            </h3>
            <div className="space-y-2">
              {/* Create Carpet button only shows for carpeting plants */}
              {isCarpetingPlant && (
                <Button
                  variant="default"
                  className="w-full flex items-center justify-center px-3 py-2 rounded text-sm"
                  onClick={() => asset && createCarpet(asset)}
                >
                  <FaThLarge className="mr-1.5" /> Create Carpet Pattern
                </Button>
              )}
              
              {/* One unified "Select All" button that's context-aware */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center px-3 py-2 rounded text-sm"
                onClick={() => {
                  if (selectedElement.carpetGroupId) {
                    // If this is part of a carpet, select all in that carpet
                    selectAllOfType(selectedElement.name, selectedElement.carpetGroupId);
                  } else {
                    // Otherwise select all of this plant type
                    selectAllOfType(selectedElement.name);
                  }
                }}
              >
                <FaObjectGroup className="mr-1.5" /> 
                {selectedElement.carpetGroupId 
                  ? "Select All in Carpet" 
                  : "Select All of Same Type"}
              </Button>
              
              {isCarpetingPlant && (
                <p className="text-xs text-muted-foreground mt-1">
                  Creates a grid of plants to form a carpet in your aquarium.
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
            onClick={() => duplicateElement(selectedElement.id)}
          >
            <FaCopy className="mr-1.5" /> Duplicate
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center px-3 py-1.5 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition"
            onClick={() => removeElement(selectedElement.id)}
          >
            <FaTrashAlt className="mr-1.5" /> Delete
          </Button>
        </div>
      </div>
    </aside>
  );
}
