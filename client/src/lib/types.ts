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
  color?: string; // For substrate colors
}

export interface TankDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface SubstrateVariant {
  id: string;
  name: string;
  color: string;
  texture?: string; // Optional texture image URL
}

export interface SubstrateType {
  id: string;
  name: string;
  description: string;
  variants: SubstrateVariant[];
}

export interface SubstrateSettings {
  typeId: string; // ID of the substrate type
  variantId: string; // ID of the selected variant
  elevationPoints: ElevationPoint[]; // Control points for elevation
  baseHeight: number; // Base height in pixels
}

export interface ElevationPoint {
  id: string;
  x: number; // Percentage of tank width (0-100)
  y: number; // Height in pixels from bottom
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
  substrateSettings: SubstrateSettings;
}
