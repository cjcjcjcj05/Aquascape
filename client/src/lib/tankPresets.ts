export interface TankPreset {
  name: string;
  width: number;  // inches
  height: number; // inches
  depth: number;  // inches
  volume: number; // gallons
}

export const tankPresets: TankPreset[] = [
  {
    name: "5 Gallon",
    width: 16,
    height: 10,
    depth: 10,
    volume: 5
  },
  {
    name: "10 Gallon",
    width: 20,
    height: 12,
    depth: 10,
    volume: 10
  },
  {
    name: "20 Gallon Long",
    width: 30,
    height: 12,
    depth: 12,
    volume: 20
  },
  {
    name: "29 Gallon",
    width: 30,
    height: 16,
    depth: 12,
    volume: 29
  },
  {
    name: "40 Gallon Breeder",
    width: 36,
    height: 16,
    depth: 18,
    volume: 40
  },
  {
    name: "55 Gallon",
    width: 48,
    height: 20,
    depth: 12,
    volume: 55
  },
  {
    name: "75 Gallon",
    width: 48,
    height: 20,
    depth: 18,
    volume: 75
  }
]; 