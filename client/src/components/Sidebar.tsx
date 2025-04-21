import { useState } from "react";
import TankDimensions from "./TankDimensions";
import AssetLibrary from "./AssetLibrary";
import CategoryNav from "./CategoryNav";
import { Button } from "@/components/ui/button";
import { FaLayerGroup } from "react-icons/fa";
import { useStore } from "@/store/editorStore";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState<'library' | 'layers'>('library');
  const [projectName, setProjectName] = useState("My Aquascape");
  const [isEditingName, setIsEditingName] = useState(false);
  const tankDimensions = useStore(state => state.tankDimensions);
  const setTankDimensions = useStore(state => state.setTankDimensions);
  const elements = useStore(state => state.elements);
  
  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Project Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          {isEditingName ? (
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingName(false);
              }}
              className="font-poppins font-semibold text-lg border border-gray-300 rounded px-2 py-1 w-full"
              autoFocus
            />
          ) : (
            <h2 
              className="font-poppins font-semibold text-lg cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {projectName}
            </h2>
          )}
          <button className="text-ui-light hover:text-ui-dark transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
        
        <TankDimensions 
          dimensions={tankDimensions}
          onChange={setTankDimensions}
        />
      </div>
      
      {/* Assets Library / Layers */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button 
              className={`flex-1 px-4 py-3 text-left font-medium ${activeTab === 'library' ? 'text-primary border-b-2 border-primary' : 'text-ui-light'} hover:bg-gray-50 transition focus:outline-none`}
              onClick={() => setActiveTab('library')}
            >
              Library
            </button>
            <button 
              className={`flex-1 px-4 py-3 text-left font-medium ${activeTab === 'layers' ? 'text-primary border-b-2 border-primary' : 'text-ui-light'} hover:bg-gray-50 transition focus:outline-none`}
              onClick={() => setActiveTab('layers')}
            >
              Layers
            </button>
          </div>
        </div>
        
        {activeTab === 'library' ? (
          <div className="flex flex-col h-full overflow-hidden">
            <CategoryNav />
            <div className="flex-1 overflow-auto">
              <AssetLibrary />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-medium text-sm mb-3">Elements</h3>
            {elements.length === 0 ? (
              <div className="text-center p-4 text-ui-light">
                <FaLayerGroup className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No elements yet. Drag items from the library to add them to your aquascape.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {elements.map((element) => (
                  <li key={element.id} className="p-2 bg-gray-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-6 h-6 mr-2 flex-shrink-0 bg-white rounded border border-gray-200 overflow-hidden">
                        <img src={element.src} alt={element.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-medium truncate">{element.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
