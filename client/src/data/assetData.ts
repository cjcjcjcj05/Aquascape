import { Asset } from '../lib/types';

const assetData: Asset[] = [
  // Substrate assets
  {
    id: "1",
    category: "substrate",
    type: "gravel",
    name: "Gravel Gray",
    description: "Fine gray aquarium gravel with natural appearance, ideal for planted tanks.",
    src: "/assets/substrate/gravel_gray.png",
    defaultWidth: 300,
    defaultHeight: 100
  },
  {
    id: "2",
    category: "substrate",
    type: "sand",
    name: "Natural Sand",
    description: "Soft beige natural sand, perfect for bottom-dwelling fish and shrimp.",
    src: "/assets/substrate/sand_nature.png",
    defaultWidth: 300,
    defaultHeight: 100
  },
  
  // Hardscape assets
  {
    id: "3",
    category: "hardscape",
    type: "rock",
    name: "Dragonstone 1",
    description: "Tall textured porous stone with unique honeycomb patterns, perfect for creating dramatic landscapes.",
    src: "/assets/hardscape/dragonstone-1.png",
    defaultWidth: 180,
    defaultHeight: 220
  },
  {
    id: "4",
    category: "hardscape",
    type: "rock",
    name: "Dragonstone 2",
    description: "Wide textured porous stone with unique honeycomb patterns, ideal for creating aquascape focal points.",
    src: "/assets/hardscape/dragonstone-2.png",
    defaultWidth: 220,
    defaultHeight: 140
  },
  
  // Plant assets
  {
    id: "6",
    category: "plants",
    type: "foreground",
    name: "Monte Carlo",
    description: "Low-growing carpeting plant with small round leaves, creates lush green foreground.",
    src: "/assets/plants/monte_carlo.png",
    defaultWidth: 150,
    defaultHeight: 80
  },
  {
    id: "7",
    category: "plants",
    type: "midground",
    name: "Anubias",
    description: "Hardy plant with broad, dark green leaves, can be attached to hardscape.",
    src: "/assets/plants/anubias.png",
    defaultWidth: 150,
    defaultHeight: 120
  },
  {
    id: "8",
    category: "plants",
    type: "moss",
    name: "Java Moss",
    description: "Versatile moss that can be attached to any surface, creating natural texture.",
    src: "/assets/plants/java_moss.png",
    defaultWidth: 120,
    defaultHeight: 100
  },
  {
    id: "9",
    category: "plants",
    type: "background",
    name: "Amazon Sword",
    description: "Large broad-leafed plant perfect for tank backgrounds, adds dramatic height.",
    src: "/assets/plants/amazon_sword.png",
    defaultWidth: 180,
    defaultHeight: 220
  },
  
  // Fish assets
  {
    id: "10",
    category: "fish",
    type: "small",
    name: "Neon Tetra",
    description: "Small colorful schooling fish with vibrant blue and red colors.",
    src: "/assets/fish/neon_tetra.png",
    defaultWidth: 30,
    defaultHeight: 15
  },
  {
    id: "11",
    category: "fish",
    type: "centerpiece",
    name: "Betta Fish",
    description: "Stunning long-finned fish with vibrant colors, also known as Siamese fighting fish.",
    src: "/assets/fish/betta_fish.png",
    defaultWidth: 60,
    defaultHeight: 40
  }
];

export default assetData;