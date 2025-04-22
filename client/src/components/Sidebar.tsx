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
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Project Info - Fixed Height Header */}
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
              aria-label="Project name"
              placeholder="Enter project name"
            />
          ) : (
            <h2 
              className="font-poppins font-semibold text-lg cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {projectName}
            </h2>
          )}
          <button 
            className="text-ui-light hover:text-ui-dark transition"
            aria-label="Project options"
            title="Project options"
          >
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'library' ? 'true' : 'false'}
          id="library-tab"
          aria-controls="library-panel"
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'library'
              ? 'text-primary border-b-2 border-primary'
              : 'text-ui-light hover:text-ui-dark'
          }`}
          onClick={() => setActiveTab('library')}
        >
          Library
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'layers' ? 'true' : 'false'}
          id="layers-tab"
          aria-controls="layers-panel"
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === 'layers'
              ? 'text-primary border-b-2 border-primary'
              : 'text-ui-light hover:text-ui-dark'
          }`}
          onClick={() => setActiveTab('layers')}
        >
          <div className="flex items-center justify-center gap-1">
            <FaLayerGroup className="h-4 w-4" aria-hidden="true" />
            <span>Layers</span>
            <span className="ml-1 bg-gray-100 text-ui-light text-xs px-1.5 rounded-full">
              {elements.length}
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto"
        role="tabpanel"
        id={activeTab === 'library' ? 'library-panel' : 'layers-panel'}
        aria-labelledby={activeTab === 'library' ? 'library-tab' : 'layers-tab'}
      >
        {activeTab === 'library' ? (
          <AssetLibrary />
        ) : (
          <div className="p-4">
            {/* Layer content goes here - removed CategoryNav from here */}
          </div>
        )}
      </div>
    </aside>
  );
}
