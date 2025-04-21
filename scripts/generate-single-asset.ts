import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AssetCategory } from '../client/src/lib/types';

// ES modules equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the OpenAI API key from environment variable
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const model = "gpt-4o";

// Asset directory structure
const assetDir = path.join(__dirname, '../public/assets');
const plantsDir = path.join(assetDir, 'plants');

// Ensure directories exist
if (!fs.existsSync(plantsDir)) {
  fs.mkdirSync(plantsDir, { recursive: true });
}

/**
 * Generate a transparent PNG image of an aquarium plant using DALL-E
 */
async function generatePlantImage(
  name: string,
  description: string
): Promise<string | null> {
  try {
    console.log(`Generating image for ${name}...`);

    // Base prompt parts
    const baseStyle = "digital art style, clean lines, minimalist, simple";
    const transparentBg = "transparent background, PNG format";
    const highQuality = "high quality, detailed, professional, photo-realistic";

    // Plant-specific prompt
    const prompt = `${highQuality} aquarium plant: ${name}. ${description}. Shown with detailed leaves and structure, ${baseStyle}, ${transparentBg}, suitable for aquascaping designs.`;
    
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
    const outputPath = path.join(plantsDir, `${filename}.png`);
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
 * Generate description for a plant
 */
async function generatePlantDescription(name: string): Promise<string> {
  try {
    console.log(`Generating description for ${name}...`);

    const messages = [
      {
        role: "system" as const,
        content: `You are an aquarium expert who provides concise, factual descriptions of aquarium plants. 
        Provide a brief 1-2 sentence description that highlights key visual characteristics, 
        typical appearance, and notable features. Keep descriptions under 100 characters.`,
      },
      {
        role: "user" as const,
        content: `Please provide a short description for the aquarium plant: ${name}.`,
      },
    ];

    const response = await openai.chat.completions.create({
      model,
      messages,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received");
    }

    return content.trim();
  } catch (error) {
    console.error(`Error generating description for ${name}:`, error);
    return `${name} for aquascaping`;
  }
}

/**
 * Generate a single plant asset
 */
async function generateSinglePlant(plantName: string, plantType: string = "midground", isCarpeting: boolean = false) {
  try {
    console.log(`\nGenerating new plant asset: ${plantName}`);
    
    // Generate description for the plant
    const description = await generatePlantDescription(plantName);
    console.log(`Description: ${description}`);
    
    // Generate the image
    const imagePath = await generatePlantImage(plantName, description);
    
    if (imagePath) {
      // Normalize path for JSON
      const normalizedPath = imagePath
        .replace(/\\/g, '/')
        .split('/public/')[1];
      
      // Create the new plant asset object
      const newPlant = {
        id: `plant-${plantName.toLowerCase().replace(/\s+/g, '-')}`,
        category: "plants" as AssetCategory,
        type: plantType,
        name: plantName,
        description,
        src: `/${normalizedPath}`,
        defaultWidth: isCarpeting ? 150 : 100,
        defaultHeight: isCarpeting ? 30 : 120,
        isCarpeting
      };
      
      // Read the existing asset data file to update it
      const assetDataPath = path.join(__dirname, '../client/src/lib/assetData.ts');
      let assetDataContent = fs.readFileSync(assetDataPath, 'utf8');
      
      // Find the plants array in the content
      const plantsStartMatch = assetDataContent.match(/const plants: Asset\[] = \[/);
      const plantsEndMatch = assetDataContent.match(/\];(\s*\/\/ Fish)/);
      
      if (plantsStartMatch && plantsEndMatch) {
        // TypeScript doesn't understand that if the match exists, index must exist too
        // So we need to use type assertion (!) to tell TypeScript it's safe
        const plantsStartIndex = plantsStartMatch.index! + plantsStartMatch[0].length;
        const plantsEndIndex = plantsEndMatch.index!;
        
        // Extract the current plants array content
        const plantsArrayContent = assetDataContent.substring(plantsStartIndex, plantsEndIndex);
        
        // Create the new plant entry as text
        const newPlantEntry = `
  {
    id: "${newPlant.id}",
    category: "plants",
    type: "${newPlant.type}",
    name: "${newPlant.name}",
    description: "${newPlant.description}",
    src: "${newPlant.src}",
    defaultWidth: ${newPlant.defaultWidth},
    defaultHeight: ${newPlant.defaultHeight}${newPlant.isCarpeting ? ',\n    isCarpeting: true' : ''}
  },`;
        
        // Insert the new plant at the beginning of the plants array
        const updatedPlantsArrayContent = newPlantEntry + plantsArrayContent;
        
        // Replace the old plants array with the updated one
        const updatedAssetDataContent = 
          assetDataContent.substring(0, plantsStartIndex) + 
          updatedPlantsArrayContent + 
          assetDataContent.substring(plantsEndIndex);
        
        // Write the updated content back to the file
        fs.writeFileSync(assetDataPath, updatedAssetDataContent);
        
        console.log(`\n✅ Added new plant to asset data at ${assetDataPath}`);
      } else {
        console.error("Could not locate plants array in assetData.ts");
      }
    }
    
    console.log('\n✅ Plant asset generation completed!');
  } catch (error) {
    console.error('\n❌ Plant asset generation failed:', error);
  }
}

// Check if we have the OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.log("\n⚠️ No OpenAI API key found in OPENAI_API_KEY environment variable.");
  console.log("Please set the OPENAI_API_KEY environment variable and run again.");
  process.exit(1);
}

// Define the plant to generate
const plantName = "Hygrophila Pinnatifida";  // Change this to the plant you want to generate
const plantType = "midground";        // Options: "foreground", "midground", "background"
const isCarpeting = false;            // Set to true for carpeting plants

// Run the generator for a single plant
generateSinglePlant(plantName, plantType, isCarpeting)
  .then(() => console.log('Done!'))
  .catch(error => console.error('Error:', error));