import { SubstrateType } from "./types";

export const substrateTypes: SubstrateType[] = [
  {
    id: "sand",
    name: "Sand",
    description: "Fine-grained substrate ideal for planted aquariums and small fish species",
    variants: [
      {
        id: "sand-light",
        name: "Natural Light Sand",
        color: "#E9DAC1",
      },
      {
        id: "sand-white",
        name: "White Beach Sand",
        color: "#F5F5F5",
      },
      {
        id: "sand-golden",
        name: "Golden Sand",
        color: "#E2C391",
      },
      {
        id: "sand-tan",
        name: "Tan River Sand",
        color: "#D4BC94",
      }
    ]
  },
  {
    id: "gravel",
    name: "Gravel",
    description: "Medium-sized substrate that's great for most aquariums and beneficial bacteria",
    variants: [
      {
        id: "gravel-natural",
        name: "Natural Gravel",
        color: "#B8A378",
      },
      {
        id: "gravel-river",
        name: "River Pebbles",
        color: "#C2B280",
      },
      {
        id: "gravel-gray",
        name: "Gray Slate",
        color: "#A9A9A9",
      },
      {
        id: "gravel-red",
        name: "Red Desert",
        color: "#CD5C5C",
      }
    ]
  },
  {
    id: "aquasoil",
    name: "Aqua Soil",
    description: "Nutrient-rich substrate ideal for planted aquariums with excellent water quality benefits",
    variants: [
      {
        id: "aquasoil-dark",
        name: "Dark Brown Soil",
        color: "#4D3B27",
      },
      {
        id: "aquasoil-black",
        name: "Black Soil",
        color: "#1E1E1E",
      },
      {
        id: "aquasoil-amazon",
        name: "Amazon Clay",
        color: "#8B4513",
      }
    ]
  }
];

export function getSubstrateType(typeId: string): SubstrateType | undefined {
  return substrateTypes.find(type => type.id === typeId);
}

export function getSubstrateVariant(typeId: string, variantId: string) {
  const type = getSubstrateType(typeId);
  return type?.variants.find(variant => variant.id === variantId);
}

export function getVariantColor(typeId: string, variantId: string): string {
  const variant = getSubstrateVariant(typeId, variantId);
  return variant?.color || "#E9DAC1"; // Default sand color as fallback
}