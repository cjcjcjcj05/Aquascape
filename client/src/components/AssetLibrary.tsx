import { useState } from "react";
import { useStore } from "@/store/editorStore";
import { useDrag } from "react-dnd";
import { Asset, AssetCategory } from "@/lib/types";
import { getAssetsByCategory } from "@/lib/assetData";
import { substrateTypes } from "@/lib/substrateData";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Substrate-specific library component
function SubstrateLibrary() {
  const { 
    substrateSettings, 
    setSubstrateType, 
    setSubstrateVariant 
  } = useStore();
  
  return (
    <div className="flex-1 overflow-y-auto p-3 bg-white">
      <div className="mb-4">
        <h3 className="font-medium text-sm mb-3">Substrate Types</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Click on a substrate option to apply it to your aquarium.
        </p>
        
        {substrateTypes.map(type => (
          <div key={type.id} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{type.name}</h4>
              <Button
                variant="ghost"
                className={`px-3 py-1.5 text-xs rounded-full ${
                  substrateSettings.typeId === type.id 
                    ? 'bg-primary text-white' 
                    : 'bg-muted hover:bg-muted/80'
                }`}
                onClick={() => setSubstrateType(type.id)}
              >
                {substrateSettings.typeId === type.id ? 'Selected' : 'Select All'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{type.description}</p>
            
            <div className="grid grid-cols-2 gap-3">
              {type.variants.map(variant => (
                <SubstrateVariantItem
                  key={variant.id}
                  typeId={type.id}
                  variant={variant}
                  isSelected={
                    substrateSettings.typeId === type.id &&
                    substrateSettings.variantId === variant.id
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Individual substrate variant item
function SubstrateVariantItem({
  typeId,
  variant,
  isSelected
}: {
  typeId: string;
  variant: { id: string; name: string; color: string };
  isSelected: boolean;
}) {
  const { setSubstrateType, setSubstrateVariant } = useStore();
  
  const handleClick = () => {
    if (typeId) {
      setSubstrateType(typeId);
    }
    setSubstrateVariant(variant.id);
  };
  
  return (
    <div 
      className={`cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-105'}`}
      onClick={handleClick}
    >
      <div className="aspect-video rounded-md overflow-hidden mb-1 border border-gray-200">
        <div 
          className="w-full h-full"
          style={{ 
            backgroundColor: variant.color,
            // For demonstration, we're just using color
            // In a more complete implementation, we would use textures
            backgroundImage: 'none',
            backgroundSize: 'cover',
            backgroundBlendMode: 'multiply'
          }}
        />
      </div>
      <p className="text-sm font-medium truncate">{variant.name}</p>
      <p className="text-xs text-ui-light">{typeId.charAt(0).toUpperCase() + typeId.slice(1)}</p>
    </div>
  );
}

// Regular asset item for other categories
function AssetItem({ asset }: { asset: Asset }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ASSET',
    item: asset,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  return (
    <div 
      ref={drag}
      className={`cursor-grab ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-1 border border-gray-200">
        <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" />
      </div>
      <p className="text-sm font-medium truncate">{asset.name}</p>
      <p className="text-xs text-ui-light">{asset.description}</p>
    </div>
  );
}

// Main component that renders either substrate library or regular assets
export default function AssetLibrary() {
  const currentCategory = useStore(state => state.currentCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // If this is the substrate category, render the substrate picker
  if (currentCategory === 'substrate') {
    return <SubstrateLibrary />;
  }
  
  // For other categories, render normal assets
  const assets = getAssetsByCategory(currentCategory);
  const types = ["all", ...Array.from(new Set(assets.map(asset => asset.type)))];
  
  // Filter assets based on search and type
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || asset.type === selectedType;
    return matchesSearch && matchesType;
  });
  
  return (
    <div className="flex-1 overflow-y-auto p-3 bg-white">
      <div className="mb-3">
        <div className="relative">
          <Input
            type="text"
            placeholder={`Search ${currentCategory}...`}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-light" />
        </div>
      </div>
      
      <div className="mb-3">
        <h3 className="font-medium text-sm mb-2">{currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Types</h3>
        <div className="flex flex-wrap gap-2">
          {types.map(type => (
            <Button
              key={type}
              variant="ghost"
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedType === type ? 'bg-[#9BE36D] text-ui-dark' : 'bg-gray-100 text-ui-dark hover:bg-gray-200'
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {filteredAssets.map((asset) => (
          <AssetItem key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}