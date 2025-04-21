import { useState } from "react";
import { useStore } from "@/store/editorStore";
import { useDrag } from "react-dnd";
import { Asset, AssetCategory } from "@/lib/types";
import { getAssetsByCategory } from "@/lib/assetData";
import { substrateTypes } from "@/lib/substrateData";
import { FaSearch, FaThLarge } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Substrate-specific library component
function SubstrateLibrary() {
  const { 
    substrateSettings, 
    setSubstrateType, 
    setSubstrateVariant 
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubstrateType, setSelectedSubstrateType] = useState<string>("all");
  
  // Get all substrate type names for filter buttons
  const substrateTypeNames = ["all", ...substrateTypes.map(type => type.id)];
  
  // Filter substrate types and variants based on search and selected type
  const filteredSubstrateItems = substrateTypes
    .filter(type => selectedSubstrateType === "all" || type.id === selectedSubstrateType)
    .flatMap(type => 
      type.variants
        .filter(variant => 
          variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(variant => ({ typeId: type.id, variant }))
    );
  
  return (
    <div 
      className="h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      style={{
        overflowY: 'scroll',
        height: 'calc(100vh - 250px)',
        maxHeight: '100%'
      }}
    >
      <div className="p-4 pb-2 sticky top-0 bg-white z-10">
        <div className="mb-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search substrate..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-sm mb-2">Substrate Types</h3>
          <div className="flex flex-wrap gap-2">
            {substrateTypeNames.map(type => (
              <Button
                key={type}
                variant={selectedSubstrateType === type ? "default" : "outline"}
                size="sm"
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedSubstrateType === type ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setSelectedSubstrateType(type)}
              >
                {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4 flex-1">
        <div className="mb-3">
          <p className="text-xs text-muted-foreground">
            Click on a substrate option to apply it to your aquarium.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {filteredSubstrateItems.map(({ typeId, variant }) => (
            <SubstrateVariantItem
              key={variant.id}
              typeId={typeId}
              variant={variant}
              isSelected={
                substrateSettings.typeId === typeId &&
                substrateSettings.variantId === variant.id
              }
            />
          ))}
        </div>
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

  const createCarpet = useStore(state => state.createCarpet);
  
  return (
    <div className="relative">
      <div 
        ref={drag}
        className={`cursor-grab ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="aspect-video bg-transparent rounded-md overflow-hidden mb-2 border border-gray-200">
          <div className="w-full h-full flex items-center justify-center bg-white">
            <img 
              src={asset.src} 
              alt={asset.name} 
              className="max-w-full max-h-full object-contain p-1" 
            />
          </div>
        </div>
        <p className="text-sm font-medium truncate">{asset.name}</p>
        <p className="text-xs text-muted-foreground line-clamp-2">{asset.description}</p>
      </div>
      
      {asset.isCarpeting && (
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={() => createCarpet(asset)}
        >
          <FaThLarge className="w-3 h-3 mr-1" />
          Carpet
        </Button>
      )}
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
    <div 
      className="h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      style={{
        overflowY: 'scroll',
        height: 'calc(100vh - 250px)',
        maxHeight: '100%'
      }}
    >
      <div className="p-4 pb-2 sticky top-0 bg-white z-10">
        <div className="mb-3">
          <div className="relative">
            <Input
              type="text"
              placeholder={`Search ${currentCategory}...`}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-sm mb-2">{currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Types</h3>
          <div className="flex flex-wrap gap-2">
            {types.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedType === type ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4 flex-1">
        <div className="grid grid-cols-2 gap-4">
          {filteredAssets.map((asset) => (
            <AssetItem key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </div>
  );
}