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
  clearHistory: () => void;
  saveProject: () => void;
  selectAllOfType: (name: string, carpetGroupId?: string) => void;
  
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
        
        // Limit history size to prevent localStorage quota issues
        // Keep only the 20 most recent states if we exceed that amount
        const MAX_HISTORY_SIZE = 20;
        const trimmedHistory = newHistory.length >= MAX_HISTORY_SIZE 
          ? newHistory.slice(-MAX_HISTORY_SIZE + 1) // Make room for new state
          : newHistory;
        
        // Adjust history index if we trimmed old states
        const adjustedIndex = newHistory.length >= MAX_HISTORY_SIZE
          ? MAX_HISTORY_SIZE - 1
          : historyIndex + 1;
        
        // Add new state to history
        set({
          history: [...trimmedHistory, newState],
          historyIndex: adjustedIndex,
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
        const { tankDimensions, substrateSettings } = get();
        const scaleFactor = 10; // 1cm = 10px
        const stageWidth = tankDimensions.width * scaleFactor;
        const stageHeight = tankDimensions.height * scaleFactor;
        
        // Calculate the actual substrate height based on the percentage
        const substrateBaseHeight = (substrateSettings.baseHeight / 100) * stageHeight;
        
        // Position where the substrate starts (bottom of the tank minus substrate height)
        const substrateY = stageHeight - substrateBaseHeight;
        
        // Create a denser grid
        const columns = 16; // More columns for fuller coverage
        const rows = 5;
        
        // Ensure complete edge-to-edge coverage with minimal margins
        const margin = 0; // No margin for complete coverage
        const usableWidth = stageWidth;
        
        // Calculate spacing - slightly overlap plants for a denser look
        const columnSpacing = usableWidth / (columns - 1); // Subtract 1 to ensure full coverage
        const defaultHeight = asset.defaultHeight || 30;
        const defaultWidth = asset.defaultWidth || 100;
        const rowSpacing = defaultHeight * 0.65; // More overlap for density
        
        const timestamp = Date.now(); // Use same timestamp for batch to avoid duplicate IDs
        const carpetId = `carpet-${timestamp}`; // Unique ID for this carpet group
        
        // First layer: Create a solid base of plants
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < columns; col++) {
            // Minimal randomness for a clean, organized look
            const randomOffsetX = Math.random() * 8 - 4; // ±4px
            const randomOffsetY = Math.random() * 6 - 3; // ±3px
            const randomScale = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1 (subtle variation)
            
            // Calculate position - ensure plants are positioned ON the substrate and properly centered
            const x = margin + (col * columnSpacing) + randomOffsetX;
            
            // Position vertically from the substrate upward - plants further from viewer are higher up
            const y = substrateY - (defaultHeight * 0.6) + (row * rowSpacing) + randomOffsetY;
            
            // Ensure the plant doesn't go below the tank bottom
            const adjustedY = Math.min(y, stageHeight - 10);
            
            // Gentler rotation (-15 to +15 degrees) for a more organized look
            const gentleRotation = Math.random() * 30 - 15;
            
            const newElement: CanvasElement = {
              id: `element-${timestamp}-${row}-${col}`,
              type: asset.category,
              name: asset.name,
              src: asset.src,
              x: x,
              y: adjustedY,
              width: defaultWidth * randomScale,
              height: defaultHeight * randomScale,
              rotation: gentleRotation,
              depth: 'front',
              // Add a carpet group ID so we can select all plants from the same carpet
              carpetGroupId: carpetId
            };
            get().addElement(newElement);
          }
        }
        
        // Second layer: Fill any visible gaps, especially in the center and edges
        // Place 15 plants (more than before) to ensure proper coverage
        for (let i = 0; i < 15; i++) {
          // Position strategically to fill gaps - focus on center and edges
          let col, x;
          
          if (i < 5) {
            // Focus on edges
            col = i < 3 ? 0.5 : columns - 1.5;
            x = i < 3 ? margin + 5 : stageWidth - 5 - defaultWidth;
          } else {
            // Focus on center and random spots to fill gaps
            col = 1 + Math.random() * (columns - 2);
            x = margin + (col * columnSpacing) + columnSpacing/2;
          }
          
          const row = Math.random() * (rows - 1);
          const y = substrateY - (defaultHeight * 0.6) + (row * rowSpacing) + rowSpacing/2;
          
          // Ensure the plant doesn't go below the tank bottom
          const adjustedY = Math.min(y, stageHeight - 10);
          
          // Gentle rotation like the main grid
          const gentleRotation = Math.random() * 30 - 15;
          
          const newElement: CanvasElement = {
            id: `element-${timestamp}-fill-${i}`,
            type: asset.category,
            name: asset.name,
            src: asset.src,
            x: x,
            y: adjustedY,
            width: defaultWidth * 0.9, // Slightly smaller to fit in gaps
            height: defaultHeight * 0.9,
            rotation: gentleRotation,
            depth: 'front',
            carpetGroupId: carpetId
          };
          get().addElement(newElement);
        }
        
        get().pushHistory();
      },
      
      // Select all elements of a specific type by name/group
      selectAllOfType: (name: string, carpetGroupId?: string) => {
        const { elements } = get();
        
        // Filter elements by name and optionally by carpet group ID
        const matchingElements = elements.filter(el => {
          if (carpetGroupId) {
            return el.name === name && el.carpetGroupId === carpetGroupId;
          }
          return el.name === name;
        });
        
        // If we found matching elements, highlight the first one
        if (matchingElements.length > 0) {
          // First, deselect any current selection
          set({ selectedElement: null });
          
          // Then select the first element
          setTimeout(() => {
            set({ selectedElement: matchingElements[0].id });
            console.log(`Selected ${matchingElements.length} ${name} plants`);
          }, 50);
        }
      },
      
      // Add clear all elements functionality
      clearAllElements: () => {
        set({ elements: [] });
        get().pushHistory();
      },
      
      // Clear history to fix localStorage quota issues
      clearHistory: () => {
        const state = get();
        // Save current state as the only history state
        const currentState: HistoryState = {
          tankDimensions: { ...state.tankDimensions },
          elements: JSON.parse(JSON.stringify(state.elements)),
          selectedElement: state.selectedElement,
          currentCategory: state.currentCategory,
          substrateSettings: JSON.parse(JSON.stringify(state.substrateSettings))
        };
        
        set({
          history: [currentState],
          historyIndex: 0,
          canUndo: false,
          canRedo: false
        });
      },
      
      saveProject: async () => {
        try {
          const state = get();
          const { tankDimensions, elements } = state;
          
          // Format data for API
          const designData = {
            name: `Aquascape Design ${new Date().toLocaleDateString()}`,
            width: tankDimensions.width,
            height: tankDimensions.height,
            depth: tankDimensions.depth,
            elements: elements,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Make API request to save design
          const response = await fetch('/api/designs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(designData),
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to save design to server');
          }
          
          console.log('Project saved to database');
          return await response.json();
        } catch (error) {
          console.error('Error saving project:', error);
          // Fall back to localStorage if saving to server fails
          console.log('Project saved to localStorage only');
          return null;
        }
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
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            return localStorage.getItem(name);
          } catch (error) {
            console.warn('Error accessing localStorage:', error);
            
            // Add a visible notification for users about the error and solution
            if (document.getElementById('storage-error-notification') === null) {
              const notification = document.createElement('div');
              notification.id = 'storage-error-notification';
              notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #fff5f5;
                border-left: 4px solid #ff4d4f;
                padding: 10px 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                max-width: 400px;
              `;
              
              notification.innerHTML = `
                <h3 style="margin: 0 0 8px; color: #333;">Storage Error Detected</h3>
                <p style="margin: 0 0 8px;">We're having trouble accessing your saved data.</p>
                <a href="/reset-storage.html" target="_blank" style="color: #0070f3; text-decoration: underline;">
                  Click here to fix the issue
                </a>
                <button style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer; font-size: 16px;"
                  onclick="this.parentElement.remove()">×</button>
              `;
              
              document.body.appendChild(notification);
            }
            
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // Aggressively trim history to avoid quota issues
            if (name === 'aquadesign-storage') {
              try {
                const data = JSON.parse(value);
                if (data && data.state && data.state.history) {
                  // More aggressive history trimming - only keep 5 most recent states
                  // This helps prevent quota issues
                  const MAX_HISTORY = 5; 
                  if (data.state.history.length > MAX_HISTORY) {
                    data.state.history = data.state.history.slice(-MAX_HISTORY);
                    data.state.historyIndex = Math.min(data.state.historyIndex, MAX_HISTORY - 1);
                    localStorage.setItem(name, JSON.stringify(data));
                    return;
                  }
                }
              } catch (parseError) {
                console.warn('Error parsing storage data:', parseError);
                // Still attempt to set the item even if parsing failed
              }
            }
            
            // Make the storage attempt
            localStorage.setItem(name, value);
          } catch (error) {
            console.warn('Error writing to localStorage:', error);
            
            // Show error notification
            if (!document.getElementById('storage-quota-notification')) {
              const quotaNotification = document.createElement('div');
              quotaNotification.id = 'storage-quota-notification';
              quotaNotification.style.cssText = `
                position: fixed;
                top: 60px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #fff5f5;
                border: 1px solid #ff4d4f;
                border-radius: 4px;
                padding: 10px 15px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                width: 300px;
                text-align: center;
              `;
              
              quotaNotification.innerHTML = `
                <h4 style="margin: 0 0 5px; color: #ff4d4f;">Storage Quota Exceeded</h4>
                <p style="margin: 0 0 10px; font-size: 13px;">
                  Your design is too large for browser storage. 
                  <a href="/reset-storage.html" target="_blank" style="color: #0070f3;">
                    Clear history
                  </a> to fix.
                </p>
                <button style="position: absolute; top: 5px; right: 5px; background: none; border: none; cursor: pointer;"
                  onclick="this.parentElement.remove()">×</button>
              `;
              
              document.body.appendChild(quotaNotification);
              
              // Auto-remove after 5 seconds
              setTimeout(() => {
                if (document.getElementById('storage-quota-notification')) {
                  document.getElementById('storage-quota-notification').remove();
                }
              }, 5000);
            }
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            console.warn('Error removing from localStorage:', error);
          }
        }
      }))
    }
  )
);
