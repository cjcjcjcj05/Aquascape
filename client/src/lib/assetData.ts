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
    id: "plant-eleocharis-mini",
    category: "plants",
    type: "foreground",
    name: "Eleocharis acicularis 'Mini'",
    description: "Delicate, grass-like carpeting plant perfect for creating natural foreground lawns.",
    src: "/assets/plants/eleocharis_mini.png",
    defaultWidth: 120,
    defaultHeight: 40,
    isCarpeting: true
  },
  {
    id: "plant-1",
    category: "plants",
    type: "foreground",
    name: "Dwarf Hairgrass",
    description: "Carpet plant",
    src: "https://images.unsplash.com/photo-1643306963178-9ec148e8c2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 100,
    defaultHeight: 50,
    isCarpeting: true
  },
  {
    id: "plant-2",
    category: "plants",
    type: "midground",
    name: "Anubias Nana",
    description: "Hardy plant with broad, dark green leaves, can be attached to hardscape.",
    src: "/assets/plants/anubias.png",
    defaultWidth: 80,
    defaultHeight: 70
  },
  {
    id: "plant-3",
    category: "plants",
    type: "background",
    name: "Amazon Sword",
    description: "Large broad-leafed plant perfect for tank backgrounds, adds dramatic height.",
    src: "/assets/plants/amazon_sword.png",
    defaultWidth: 120,
    defaultHeight: 180
  },
  {
    id: "plant-4",
    category: "plants",
    type: "midground",
    name: "Java Fern",
    description: "Hardy plant",
    src: "https://images.unsplash.com/photo-1603383977221-b2636408fbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 100,
    defaultHeight: 120
  },
  {
    id: "plant-5",
    category: "plants",
    type: "background",
    name: "Vallisneria",
    description: "Tall grassy",
    src: "https://images.unsplash.com/photo-1604335399105-a0c585fd81fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 80,
    defaultHeight: 200
  },
  {
    id: "plant-6",
    category: "plants",
    type: "foreground",
    name: "Monte Carlo",
    description: "Low-growing carpeting plant with small round leaves, creates lush green foreground.",
    src: "/assets/plants/monte_carlo.png",
    defaultWidth: 150,
    defaultHeight: 30,
    isCarpeting: true
  },
  {
    id: "plant-7",
    category: "plants",
    type: "midground",
    name: "Alternanthera Reineckii",
    description: "Red plant",
    src: "https://images.unsplash.com/photo-1601479604588-68d9e6d386b6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 90,
    defaultHeight: 120
  },
  {
    id: "plant-8",
    category: "plants",
    type: "midground",
    name: "Cryptocoryne Wendtii",
    description: "Versatile plant",
    src: "https://images.unsplash.com/photo-1603383977086-2fb8af9c10c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 90,
    defaultHeight: 100
  },
  {
    id: "plant-9",
    category: "plants",
    type: "background",
    name: "Rotala Rotundifolia",
    description: "Stem plant",
    src: "https://images.unsplash.com/photo-1597301882048-edfa0069d982?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 70,
    defaultHeight: 160
  },
  {
    id: "plant-10",
    category: "plants",
    type: "midground",
    name: "Bucephalandra",
    description: "Slow growing",
    src: "https://images.unsplash.com/photo-1613763467024-8c4782e542c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    defaultWidth: 80,
    defaultHeight: 70
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
