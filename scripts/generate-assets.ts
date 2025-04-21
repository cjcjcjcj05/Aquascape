import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { AssetCategory } from '../client/src/lib/types';

// You'll need to set your OpenAI API key
// Use the OPENAI_API_KEY environment variable or set it here
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const model = "gpt-4o";

// Define asset categories
const categories: Record<AssetCategory, string[]> = {
  substrate: [
    "Fine white sand",
    "Black aquasoil substrate",
    "Natural river gravel",
    "Planted aquarium substrate",
    "Coarse decorative sand",
    "Crushed coral substrate",
  ],
  hardscape: [
    "Dragon stone rock",
    "Spider wood driftwood",
    "Seiryu stone",
    "Manzanita driftwood",
    "Lava rock",
    "Slate stone",
    "Ohko stone",
    "Malaysian driftwood",
  ],
  plants: [
    "Amazon sword (Echinodorus)",
    "Java fern (Microsorum pteropus)",
    "Anubias nana",
    "Dwarf hairgrass (Eleocharis acicularis)",
    "Water wisteria (Hygrophila difformis)",
    "Rotala rotundifolia",
    "Ludwigia repens",
    "Vallisneria",
    "Cryptocoryne wendtii",
    "Monte Carlo (Micranthemum tweediei)",
  ],
  fish: [
    "Neon tetra",
    "Betta fish",
    "Guppy",
    "Corydoras catfish",
    "Otocinclus catfish",
    "Cherry shrimp",
    "Amano shrimp",
    "Celestial pearl danio",
    "German blue ram",
    "Ember tetra",
  ],
};

// Asset directory structure
const assetDir = path.join(__dirname, '../public/assets');
const outputDirs: Record<AssetCategory, string> = {
  substrate: path.join(assetDir, 'substrate'),
  hardscape: path.join(assetDir, 'hardscape'),
  plants: path.join(assetDir, 'plants'),
  fish: path.join(assetDir, 'fish'),
};

// Ensure directories exist
Object.values(outputDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Generate a transparent PNG image of an aquarium element using DALL-E
 */
async function generateAssetImage(
  category: AssetCategory,
  name: string,
  description: string
): Promise<string | null> {
  try {
    console.log(`Generating image for ${name}...`);

    // Base prompt parts
    const baseStyle = "digital art style, clean lines, minimalist, simple";
    const transparentBg = "transparent background, PNG format";
    const highQuality = "high quality, detailed, professional, photo-realistic";

    // Category-specific prompts
    let prompt = "";
    if (category === 'substrate') {
      prompt = `${highQuality} aquarium substrate: ${name}. ${description}. Shown as a small pile or layer, ${baseStyle}, ${transparentBg}, suitable for aquascaping designs.`;
    } 
    else if (category === 'hardscape') {
      prompt = `${highQuality} aquarium hardscape element: ${name}. ${description}. Single piece shown at an angle to demonstrate shape and texture, ${baseStyle}, ${transparentBg}, suitable for aquascaping designs.`;
    }
    else if (category === 'plants') {
      prompt = `${highQuality} aquarium plant: ${name}. ${description}. Shown with detailed leaves and structure, ${baseStyle}, ${transparentBg}, suitable for aquascaping designs.`;
    }
    else if (category === 'fish') {
      prompt = `${highQuality} aquarium fish or invertebrate: ${name}. ${description}. Side view showing distinctive features and coloration, ${baseStyle}, ${transparentBg}, suitable for aquascaping designs.`;
    }

    const response = await openai.images.generate({
      model: "dall-e-3", // Using DALL-E 3 for image generation
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
    });

    if (!response.data[0].b64_json) {
      throw new Error("No image data received");
    }

    // Convert name to filename
    const filename = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    // Save image
    const outputPath = path.join(outputDirs[category], `${filename}.png`);
    fs.writeFileSync(
      outputPath,
      Buffer.from(response.data[0].b64_json, 'base64')
    );

    console.log(`✅ Generated ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`Error generating image for ${name}:`, error);
    return null;
  }
}

/**
 * Generate descriptions for items
 */
async function generateItemDescriptions(
  category: AssetCategory,
  items: string[]
): Promise<Record<string, string>> {
  try {
    console.log(`Generating descriptions for ${category}...`);

    const messages = [
      {
        role: "system" as const,
        content: `You are an aquarium expert who provides concise, factual descriptions of aquarium elements. 
        For each item, provide a brief 1-2 sentence description that highlights key visual characteristics, 
        typical appearance, and notable features. Keep descriptions under 100 characters.`,
      },
      {
        role: "user" as const,
        content: `Please provide short descriptions for the following ${category} items. 
        Format as valid JSON with the item name as the key and the description as the value:
        ${items.join(", ")}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model,
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error(`Error generating descriptions for ${category}:`, error);
    return {};
  }
}

/**
 * Generate a JSON file with asset information
 */
async function generateAssetData() {
  try {
    const allAssets = [];
    let id = 1;

    for (const [category, items] of Object.entries(categories)) {
      console.log(`\nProcessing ${category} assets...`);
      
      // Get descriptions for all items in this category
      const descriptions = await generateItemDescriptions(
        category as AssetCategory, 
        items
      );

      // Process each item
      for (const name of items) {
        // If we already have API key, we can generate images
        if (process.env.OPENAI_API_KEY) {
          console.log(`\nGenerating asset for: ${name}`);
          const description = descriptions[name] || `${name} for aquascaping`;
          const imagePath = await generateAssetImage(
            category as AssetCategory,
            name,
            description
          );

          if (imagePath) {
            // Normalize path for JSON
            const normalizedPath = imagePath
              .replace(/\\/g, '/')
              .split('/public/')[1];

            allAssets.push({
              id: `${id++}`,
              category: category as AssetCategory,
              type: category,
              name,
              description,
              src: `/${normalizedPath}`,
            });
          }
        } 
        // Without API key, just create the asset data without images
        else {
          allAssets.push({
            id: `${id++}`,
            category: category as AssetCategory,
            type: category,
            name,
            description: descriptions[name] || `${name} for aquascaping`,
            // Use a placeholder if we don't have images
            src: `/assets/${category}/placeholder.png`,
          });
        }
      }
    }

    // Save asset data to JSON file
    const assetDataPath = path.join(__dirname, '../client/src/data/assetData.json');
    fs.writeFileSync(assetDataPath, JSON.stringify(allAssets, null, 2));
    console.log(`\n✅ Generated asset data saved to ${assetDataPath}`);

    // Generate TypeScript file to export asset data
    const tsFilePath = path.join(__dirname, '../client/src/data/assetData.ts');
    fs.writeFileSync(
      tsFilePath,
      `import { Asset } from '../lib/types';\n\nconst assetData: Asset[] = ${JSON.stringify(allAssets, null, 2)};\n\nexport default assetData;\n`
    );
    console.log(`✅ Generated TypeScript file saved to ${tsFilePath}`);

  } catch (error) {
    console.error('Error generating asset data:', error);
  }
}

// Check if we have the OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.log("\n⚠️ No OpenAI API key found in OPENAI_API_KEY environment variable.");
  console.log("This script will generate asset data but not the actual images.");
  console.log("To generate images, please set the OPENAI_API_KEY environment variable and run again.");
}

// Run the generator
generateAssetData()
  .then(() => console.log('\n✅ Asset generation completed!'))
  .catch(error => console.error('\n❌ Asset generation failed:', error));