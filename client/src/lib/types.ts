export type AssetCategory = 'substrate' | 'hardscape' | 'plants' | 'fish';

export interface Asset {
  id: string;
  category: AssetCategory;
  type: string;
  name: string;
  description: string;
  src: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface TankDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface CanvasElement {
  id: string;
  type: string;
  name: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  depth: 'front' | 'middle' | 'back';
}

export interface Design {
  id: number;
  name: string;
  tankDimensions: TankDimensions;
  elements: CanvasElement[];
  createdAt: string;
  updatedAt: string;
}

export interface HistoryState {
  tankDimensions: TankDimensions;
  elements: CanvasElement[];
  selectedElement: string | null;
  currentCategory: AssetCategory;
}
