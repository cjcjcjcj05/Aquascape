import { Asset, AssetCategory } from "./types";

// Substrates
const substrates: Asset[] = [
  {
    id: "substrate-1",
    category: "substrate",
    type: "sand",
    name: "Sand Nature",
    description: "Soft beige natural sand, perfect for bottom-dwelling fish and shrimp.",
    src: "/assets/substrate/sand_nature.png",
    defaultWidth: 300,
    defaultHeight: 50
  },
  {
    id: "substrate-2",
    category: "substrate",
    type: "gravel",
    name: "Gravel Gray",
    description: "Fine gray aquarium gravel with natural appearance, ideal for planted tanks.",
    src: "/assets/substrate/gravel_gray.png",
    defaultWidth: 300,
    defaultHeight: 50
  },
  {
    id: "substrate-3",
    category: "substrate",
    type: "sand",
    name: "Sand Bright",
    description: "Fine grain",
    src: "https://images.unsplash.com/photo-1600267546005-55766a862487?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 300,
    defaultHeight: 50
  },
  {
    id: "substrate-4",
    category: "substrate",
    type: "soil",
    name: "Aqua Soil",
    description: "Nutrient-rich",
    src: "https://images.unsplash.com/photo-1615486780246-76ee57f90371?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 300,
    defaultHeight: 50
  },
  {
    id: "substrate-5",
    category: "substrate",
    type: "gravel",
    name: "Gravel Nature",
    description: "Mixed grain",
    src: "https://images.unsplash.com/photo-1593121925328-369cc2459647?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 300,
    defaultHeight: 50
  },
  {
    id: "substrate-6",
    category: "substrate",
    type: "sand",
    name: "Black Sand",
    description: "Fine grain",
    src: "https://images.unsplash.com/photo-1606170033648-5d55a3edf314?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 300,
    defaultHeight: 50
  }
];

// Hardscape (rocks, driftwood)
const hardscape: Asset[] = [
  {
    id: "hardscape-dragonstone-1",
    category: "hardscape",
    type: "rock",
    name: "Dragonstone 1",
    description: "Tall textured porous stone with unique honeycomb patterns and striking vertical form",
    src: "/assets/hardscape/dragonstone-1.png",
    defaultWidth: 100,
    defaultHeight: 140
  },
  {
    id: "hardscape-dragonstone-2",
    category: "hardscape",
    type: "rock",
    name: "Dragonstone 2",
    description: "Wide textured porous stone with honeycomb patterns, perfect for creating terraces",
    src: "/assets/hardscape/dragonstone-2.png",
    defaultWidth: 140,
    defaultHeight: 80
  }
];

// Plants
const plants: Asset[] = [
  {
    id: "plant-1",
    category: "plants",
    type: "foreground",
    name: "Eleocharis acicularis 'Mini'",
    description: "A dwarf variety of hairgrass with fine, bright green needle-like leaves, ideal for creating lush carpets in the foreground of aquascapes.",
    src: "/assets/plants/eleocharis_mini.png",
    defaultWidth: 150,
    defaultHeight: 50
  }
];

// Fish
const fish: Asset[] = [
  {
    id: "fish-1",
    category: "fish",
    type: "small",
    name: "Neon Tetra",
    description: "Small colorful schooling fish with vibrant blue and red colors.",
    src: "/assets/fish/neon_tetra.png",
    defaultWidth: 40,
    defaultHeight: 20
  },
  {
    id: "fish-2",
    category: "fish",
    type: "medium",
    name: "Betta Fish",
    description: "Stunning long-finned fish with vibrant colors, also known as Siamese fighting fish.",
    src: "/assets/fish/betta_fish.png",
    defaultWidth: 60,
    defaultHeight: 40
  },
  {
    id: "fish-3",
    category: "fish",
    type: "small",
    name: "Guppy",
    description: "Colorful fish",
    src: "https://images.unsplash.com/photo-1513039733422-0aedfec36e6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 35,
    defaultHeight: 20
  },
  {
    id: "fish-4",
    category: "fish",
    type: "bottom",
    name: "Corydoras",
    description: "Bottom dweller",
    src: "https://images.unsplash.com/photo-1593642533144-3d62aa4783ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 50,
    defaultHeight: 30
  },
  {
    id: "fish-5",
    category: "fish",
    type: "medium",
    name: "Angelfish",
    description: "Tall fish",
    src: "https://images.unsplash.com/photo-1518731501346-9f936359fadf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 70,
    defaultHeight: 80
  },
  {
    id: "fish-6",
    category: "fish",
    type: "bottom",
    name: "Pleco",
    description: "Algae eater",
    src: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 90,
    defaultHeight: 40
  }
];

// Get assets by category
export function getAssetsByCategory(category: AssetCategory): Asset[] {
  switch (category) {
    case 'substrate':
      return substrates;
    case 'hardscape':
      return hardscape;
    case 'plants':
      return plants;
    case 'fish':
      return fish;
    default:
      return [];
  }
}

// Get all assets
export function getAllAssets(): Asset[] {
  return [...substrates, ...hardscape, ...plants, ...fish];
}

// Get asset by ID
export function getAssetById(id: string): Asset | undefined {
  return getAllAssets().find(asset => asset.id === id);
}
