import { useState } from "react";
import { useStore } from "@/store/editorStore";
import { useDrag } from "react-dnd";
import { Asset, AssetType } from "@/lib/types";
import { getAssetsByCategory } from "@/lib/assetData";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AssetLibrary() {
  const currentCategory = useStore(state => state.currentCategory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  const assets = getAssetsByCategory(currentCategory);
  const types = ["all", ...new Set(assets.map(asset => asset.type))];
  
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
