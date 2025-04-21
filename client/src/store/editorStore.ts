import { create } from 'zustand';
import { 
  AssetCategory, 
  CanvasElement, 
  HistoryState, 
  TankDimensions, 
  SubstrateSettings, 
  ElevationPoint,
  Asset
} from '@/lib/types';
import { getSubstrateVariant } from '@/lib/substrateData';
import { persist, createJSONStorage } from 'zustand/middleware';

interface EditorState {
  // Current state
  tankDimensions: TankDimensions;
  elements: CanvasElement[];
  selectedElement: string | null;
  currentCategory: AssetCategory;
  substrateSettings: SubstrateSettings;
  
  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  
  // Actions
  setTankDimensions: (dimensions: TankDimensions) => void;
  setSelectedElement: (id: string | null) => void;
  setCurrentCategory: (category: AssetCategory) => void;
  setSubstrateType: (typeId: string) => void;
  setSubstrateVariant: (variantId: string) => void;
  setSubstrateBaseHeight: (height: number) => void;
  addElevationPoint: (point: Omit<ElevationPoint, "id">) => void;
  updateElevationPoint: (id: string, point: Partial<ElevationPoint>) => void;
  removeElevationPoint: (id: string) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, props: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  createCarpet: (asset: Asset) => void;
  clearAllElements: () => void;
  saveProject: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useStore = create<EditorState>()(
  persist(
    (set, get) => ({
      // Initial state
      tankDimensions: { width: 60, height: 36, depth: 30 },
      elements: [],
      selectedElement: null,
      currentCategory: 'substrate',
      substrateSettings: {
        typeId: 'sand',
        variantId: 'sand-light',
        elevationPoints: [
          { id: 'point-1', x: 0, y: 0 },
          { id: 'point-2', x: 25, y: 10 },
          { id: 'point-3', x: 50, y: 15 },
          { id: 'point-4', x: 75, y: 10 },
          { id: 'point-5', x: 100, y: 0 }
        ],
        baseHeight: 30
      },
      
      // History
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,
      
      // Push current state to history
      pushHistory: () => {
        const { tankDimensions, elements, selectedElement, currentCategory, historyIndex, history, substrateSettings } = get();
        
        // Create new history state
        const newState: HistoryState = {
          tankDimensions: { ...tankDimensions },
          elements: JSON.parse(JSON.stringify(elements)),
          selectedElement,
          currentCategory,
          substrateSettings: JSON.parse(JSON.stringify(substrateSettings))
        };
        
        // Remove future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        
        // Add new state to history
        set({
          history: [...newHistory, newState],
          historyIndex: historyIndex + 1,
          canUndo: true,
          canRedo: false
        });
      },
      
      // Actions
      setTankDimensions: (dimensions) => {
        const { pushHistory } = get();
        pushHistory();
        set({ tankDimensions: dimensions });
      },
      
      setSelectedElement: (id) => {
        set({ selectedElement: id });
      },
      
      setCurrentCategory: (category) => {
        set({ currentCategory: category });
      },
      
      setSubstrateType: (typeId) => {
        const { pushHistory, substrateSettings } = get();
        pushHistory();
        // When changing substrate type, reset to the first variant of that type
        const variantId = `${typeId}-${typeId === 'sand' ? 'light' : typeId === 'aquasoil' ? 'dark' : 'natural'}`;
        set({ 
          substrateSettings: { 
            ...substrateSettings, 
            typeId, 
            variantId
          } 
        });
      },
      
      setSubstrateVariant: (variantId) => {
        const { pushHistory, substrateSettings } = get();
        pushHistory();
        set({ 
          substrateSettings: { 
            ...substrateSettings, 
            variantId
          } 
        });
      },
      
      setSubstrateBaseHeight: (baseHeight) => {
        const { pushHistory, substrateSettings } = get();
        pushHistory();
        set({ 
          substrateSettings: { 
            ...substrateSettings, 
            baseHeight 
          } 
        });
      },
      
      addElevationPoint: (point) => {
        const { pushHistory, substrateSettings } = get();
        pushHistory();
        const newPoint = {
          ...point,
          id: `point-${Date.now()}`
        };
        set({ 
          substrateSettings: { 
            ...substrateSettings, 
            elevationPoints: [...substrateSettings.elevationPoints, newPoint]
          } 
        });
      },
      
      updateElevationPoint: (id, pointData) => {
        const { pushHistory, substrateSettings } = get();
        const pointIndex = substrateSettings.elevationPoints.findIndex(p => p.id === id);
        
        if (pointIndex !== -1) {
          pushHistory();
          const updatedPoints = [...substrateSettings.elevationPoints];
          updatedPoints[pointIndex] = {
            ...updatedPoints[pointIndex],
            ...pointData
          };
          
          set({ 
            substrateSettings: { 
              ...substrateSettings, 
              elevationPoints: updatedPoints 
            } 
          });
        }
      },
      
      removeElevationPoint: (id) => {
        const { pushHistory, substrateSettings } = get();
        // Don't remove if only 2 or fewer points remain
        if (substrateSettings.elevationPoints.length <= 2) return;
        
        pushHistory();
        const filteredPoints = substrateSettings.elevationPoints.filter(p => p.id !== id);
        set({ 
          substrateSettings: { 
            ...substrateSettings, 
            elevationPoints: filteredPoints 
          } 
        });
      },
      
      addElement: (element) => {
        const { elements, pushHistory } = get();
        pushHistory();
        set({ elements: [...elements, element] });
      },
      
      updateElement: (id, props) => {
        const { elements, pushHistory } = get();
        const elementIndex = elements.findIndex(el => el.id === id);
        
        if (elementIndex !== -1) {
          pushHistory();
          const updatedElements = [...elements];
          updatedElements[elementIndex] = {
            ...updatedElements[elementIndex],
            ...props
          };
          set({ elements: updatedElements });
        }
      },
      
      removeElement: (id) => {
        const { elements, selectedElement, pushHistory } = get();
        pushHistory();
        const filteredElements = elements.filter(el => el.id !== id);
        set({ 
          elements: filteredElements,
          selectedElement: selectedElement === id ? null : selectedElement
        });
      },
      
      duplicateElement: (id) => {
        const { elements, pushHistory } = get();
        const element = elements.find(el => el.id === id);
        
        if (element) {
          pushHistory();
          const newElement: CanvasElement = {
            ...JSON.parse(JSON.stringify(element)),
            id: `element-${Date.now()}`,
            x: element.x + 20,
            y: element.y + 20
          };
          
          set({ 
            elements: [...elements, newElement],
            selectedElement: newElement.id
          });
        }
      },
      
      createCarpet: (asset: Asset) => {
        const { tankDimensions } = get();
        const scaleFactor = 10; // 1cm = 10px
        const stageWidth = tankDimensions.width * scaleFactor;
        const stageHeight = tankDimensions.height * scaleFactor;
        
        // Get the bottom 20% of the tank for placing plants
        const bottomY = stageHeight * 0.8;
        
        // Create an ordered 8×4 grid of plants as requested
        const columns = 8;
        const rows = 4;
        
        // Slight margin on each side for a more natural look
        const margin = stageWidth * 0.05;
        const usableWidth = stageWidth - (margin * 2);
        
        // Calculate spacing
        const columnSpacing = usableWidth / columns;
        const defaultHeight = asset.defaultHeight || 30;
        const rowSpacing = defaultHeight * 0.8; // Some overlap to look connected
        
        const timestamp = Date.now(); // Use same timestamp for batch to avoid duplicate IDs
        
        // Create plants in a grid pattern
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            // Add slight randomness to positions (not too wild)
            const randomOffsetX = Math.random() * 10 - 5; // ±5px
            const randomOffsetY = Math.random() * 8 - 4;  // ±4px
            const randomScale = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1 (subtle variation)
            
            const x = margin + (col * columnSpacing) + randomOffsetX;
            const y = bottomY + (row * rowSpacing) + randomOffsetY;
            
            // Gentle rotation (-20 to +20 degrees) to look natural but not wild
            const gentleRotation = Math.random() * 40 - 20;
            
            const newElement: CanvasElement = {
              id: `element-${timestamp}-${row}-${col}`,
              type: asset.category,
              name: asset.name,
              src: asset.src,
              x: x,
              y: y,
              width: (asset.defaultWidth || 100) * randomScale,
              height: defaultHeight * randomScale,
              rotation: gentleRotation,
              depth: 'front',
            };
            get().addElement(newElement);
          }
        }
        
        // Add only a few extra plants in the gaps for a fuller look
        // But not too many to keep it orderly
        for (let i = 0; i < 5; i++) {
          // Place these mostly along edges or between rows
          const col = Math.floor(Math.random() * (columns + 1));
          const row = Math.floor(Math.random() * (rows + 1)) - 0.5;
          
          const x = margin + (col * columnSpacing);
          const y = bottomY + (row * rowSpacing);
          
          // Gentle rotation just like the main grid
          const gentleRotation = Math.random() * 40 - 20;
          
          const newElement: CanvasElement = {
            id: `element-${timestamp}-extra-${i}`,
            type: asset.category,
            name: asset.name,
            src: asset.src,
            x: x,
            y: y,
            width: asset.defaultWidth || 100,
            height: defaultHeight,
            rotation: gentleRotation,
            depth: 'front',
          };
          get().addElement(newElement);
        }
        
        get().pushHistory();
      },
      
      // Add clear all elements functionality
      clearAllElements: () => {
        set({ elements: [] });
        get().pushHistory();
      },
      
      saveProject: () => {
        // This would typically save to the backend
        // For now, we're using localStorage via the persist middleware
        console.log('Project saved to localStorage');
      },
      
      // History navigation
      undo: () => {
        const { historyIndex, history } = get();
        
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const previousState = history[newIndex];
          
          set({
            tankDimensions: previousState.tankDimensions,
            elements: previousState.elements,
            selectedElement: previousState.selectedElement,
            currentCategory: previousState.currentCategory,
            substrateSettings: previousState.substrateSettings,
            historyIndex: newIndex,
            canUndo: newIndex > 0,
            canRedo: true
          });
        }
      },
      
      redo: () => {
        const { historyIndex, history } = get();
        
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const nextState = history[newIndex];
          
          set({
            tankDimensions: nextState.tankDimensions,
            elements: nextState.elements,
            selectedElement: nextState.selectedElement,
            currentCategory: nextState.currentCategory,
            substrateSettings: nextState.substrateSettings,
            historyIndex: newIndex,
            canUndo: true,
            canRedo: newIndex < history.length - 1
          });
        }
      }
    }),
    {
      name: 'aquadesign-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
