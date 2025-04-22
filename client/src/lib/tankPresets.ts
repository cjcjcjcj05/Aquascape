export interface TankPreset {
  name: string;
  width: number;  // cm
  height: number; // cm
  depth: number;  // cm
  volume: number; // gallons
}

export const tankPresets: TankPreset[] = [
  {
    name: "5 Gallon",
    width: 40.6,  // 16"
    height: 25.4, // 10"
    depth: 25.4,  // 10"
    volume: 5
  },
  {
    name: "10 Gallon",
    width: 50.8,  // 20"
    height: 30.5, // 12"
    depth: 25.4,  // 10"
    volume: 10
  },
  {
    name: "20 Gallon Long",
    width: 76.2,  // 30"
    height: 30.5, // 12"
    depth: 30.5,  // 12"
    volume: 20
  },
  {
    name: "29 Gallon",
    width: 76.2,  // 30"
    height: 40.6, // 16"
    depth: 30.5,  // 12"
    volume: 29
  },
  {
    name: "40 Gallon Breeder",
    width: 91.4,  // 36"
    height: 40.6, // 16"
    depth: 45.7,  // 18"
    volume: 40
  },
  {
    name: "55 Gallon",
    width: 122,   // 48"
    height: 50.8, // 20"
    depth: 30.5,  // 12"
    volume: 55
  },
  {
    name: "75 Gallon",
    width: 122,   // 48"
    height: 50.8, // 20"
    depth: 45.7,  // 18"
    volume: 75
  }
]; 