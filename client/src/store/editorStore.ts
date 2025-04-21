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
        
        // Get the bottom 25% of the tank for placing plants
        const bottomY = stageHeight * 0.75;
        
        // Create a grid of plants - 5 columns, 2 rows
        const columns = 5;
        const rows = 2;
        
        // Leave some margin on the sides
        const margin = stageWidth * 0.1;
        const usableWidth = stageWidth - (margin * 2);
        
        // Calculate spacing
        const columnSpacing = usableWidth / columns;
        const defaultHeight = asset.defaultHeight || 30;
        const rowSpacing = defaultHeight * 0.7;
        
        // Create plants
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            // Add some randomness to positions
            const randomOffsetX = Math.random() * 20 - 10;
            const randomOffsetY = Math.random() * 10 - 5;
            
            const x = margin + (col * columnSpacing) + randomOffsetX;
            const y = bottomY + (row * rowSpacing) + randomOffsetY;
            
            const newElement: CanvasElement = {
              id: `element-${Date.now()}-${row}-${col}`,
              type: asset.category,
              name: asset.name,
              src: asset.src,
              x: x,
              y: y,
              width: asset.defaultWidth || 100,
              height: defaultHeight,
              rotation: Math.random() * 30 - 15, // Random rotation between -15 and 15 degrees
              depth: 'front', // Use front instead of foreground
            };
            get().addElement(newElement);
          }
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
